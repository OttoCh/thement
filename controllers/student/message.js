"use strict"

// load lecturers
var lect      = require('../../models/lecturer.model'),
    student   = require('../../models/student'),
    lecturer  = require('../../models/lecturer'),
    report    = require('../../models/report'),
    msg       = require('../../models/message'),
    funcs     = require('../../middlewares/funcs'),
    multer    = require('multer')

var baseurl       = require('../../config/baseurl'),
    baseurl       = baseurl.root + 'student'

const root_url= 'http://localhost:3500'

exports.getAll = function(req, res){
  
  let nim = req.session.student
  let hideAllMsg = 'hide', showInbox = 'hide', showOutbox = 'hide', showBroadcast = 'hide'
  student.findOne({nim:nim}, function(err, std){
    if(std.supervisor !== "" && std.is_accepted == true){
      // findOne, if not found, create one
      let superv      = std.supervisor
      lecturer.findOne({username:superv}, function(err, full){
        let supervFull = full.name
        let nimStr     = nim.toString()
        nimStr         = JSON.parse("[" + nimStr + "]")
        msg.findOne({members: {$in: [superv]},},
          function(err, strs){
            let msgs        = strs.messages
            let _id         = strs._id
            
            // get query
            let quer = req.query.type
            switch(quer){
              case 'outbox': showInbox = 'hide', showBroadcast = 'hide', showOutbox = ''
              break;

              case 'broadcast': showInbox = 'hide', showOutbox = 'hide', showBroadcast = ''
              break;

              default: showInbox = ''
            }

            // get all inbox
            var inboxMsg = []
            msg.aggregate({$match:{"nim":nim}},
                {$unwind:"$messages"},
              {$match:{"messages.author":superv}
            },
              function(err, agg){
                if(agg){
                // convert to array
                  let inboxs   = agg
                  let inboxLen = agg.length
                  
                  for(var i=0; i<inboxLen; i++){
                  inboxMsg.push({
                      index:i+1,
                      author:inboxs[i].messages.author,
                      body:inboxs[i].messages.body,
                      date_created:funcs.friendlyDate(inboxs[i].messages.date_created),
                    })
                  }

                  inboxMsg.sort(function(a,b){
                    return parseFloat(b.index) - parseFloat(a.index)
                  })                  

                  // get all outbox
                  let nimStr = nim.toString()
                  var outboxMsg = []
                  msg.aggregate({$match:{"nim":nim}},
                    {$unwind:"$messages"},
                    {$match:{"messages.author":nimStr}
                  },
                  function(err, out){
                    if(out){
                      
                      let outboxs   = out
                      let outboxLen = out.length
                      
                      for(var k=0; k<outboxLen; k++){
                      outboxMsg.push({
                          index:k+1,
                          author:"YOU",
                          body:outboxs[k].messages.body,
                          date_created:funcs.friendlyDate(outboxs[k].messages.date_created),
                        })
                      }

                      outboxMsg.sort(function(a,b){
                        return parseFloat(b.index) - parseFloat(a.index)
                      })
                      
                      // set has_seen_std to true
                      msg.update({nim:nim},{$set:{
                        has_seen_std:true
                      },}, function(e, cb){
                        if(cb){

                          // get all broadcast
                          msg.findOne({lecturer:superv}, function(err, bc){
                            let bcMsg = []
                            let newBC = 'hide'
                            
                            if(bc.messages.length>0){
                              let bcs   = bc.messages
                              for(var l=0; l<bcs.length; l++){
                                bcMsg.push({
                                  id:l+1,
                                  author:bcs[l].author,
                                  bodyfull:bcs[l].body,
                                  body:bcs[l].body.substr(0, bcs[l].body.length-5),
                                  date_created:funcs.friendlyDate(bcs[l].date_created),
                                  has_seen_by:bcs[l].has_seen_by
                                })
                              }
                              
                              bcMsg.sort(function(a,b){
                                return parseFloat(b.id) - parseFloat(a.id)
                              })
                              
                              let has_seen = bcMsg[0].has_seen_by
                              
                              if(has_seen.length > 0){
                                if(has_seen.includes(nimStr) == true){
                                  newBC = 'hide'
                                } else {
                                  newBC = ''
                                }
                              } else {
                                newBC = ''
                              }
                            } else {
                              bcMsg = ''
                            }
                            
                            res.render('student/message/all', {title:"All Messages", baseurl, supervFull, nim,
                            hideAllMsg, showInbox, showOutbox, superv, inboxMsg, outboxMsg, showBroadcast, bcMsg,
                            newBC
                          })
                      })
                        }
                      }) 
                    } else {
                      console.log('no outgoing message')
                    }
                  })
                }
              }            
            )
          }
        )
      })
    } else {
      console.log('please choose supervisor first')
      res.redirect(baseurl)
    }
  })
}

exports.getDetailBroadcast = function(req, res){
  let bc_id = req.params.id
  let nim   = req.session.student
  
  let nimstr = nim.toString()
  student.findOne({nim:nim}, function(err,std){
    let superv = std.supervisor
    msg.findOne({lecturer:superv}, function(err, bc){
      var bcDetail
      let other   = bc.members
      let index   = other.indexOf(nimstr)
      if(index > -1){
        other.splice(index, 1)
      }
            
      let msgs  = bc.messages
      var found = msgs.filter(function(item){
        return item.id == bc_id
      })
      found = found[0]

        if(found){
          let timeBC = funcs.friendlyDate(found.date_created)
           // check if has_seen_by is filled
           if(found.has_seen_by.includes(nimstr) == false){
             msg.update({lecturer:superv, "messages.id":Number(bc_id)},{
            "$push":{
              "messages.$.has_seen_by": nimstr
            },
          }, function(err, seen){
            
            res.render('student/message/bc-detail',{title:"Broadcast detail", baseurl, found, timeBC, other})
          })
           } else {
             res.render('student/message/bc-detail',{title:"Broadcast detail", baseurl, found, timeBC, other})
           }
        } else {
          res.redirect(baseurl)
        }
    })
  })
}

exports.sendMessage = function(req, res){
  let nim         = req.session.student
  let msgBody     = req.body.msg
  let supervisor  = req.body.supervisor

  msg.findOne({nim:nim}, function(e, m){
    let msgLength = m.messages.length
      if(msgLength > 0){
        msgLength = msgLength
      } else {
        msgLength = 0
      }
      // ADD MESSAGE NOTIF TO LECTURER
      msg.update({nim:nim},{$set:{
        has_seen_lecturer:false
      },
      $push:{
      messages:{
        "id":msgLength+1,
        "author": nim.toString(),
        "body": msgBody,
        "date_created": new Date()
      }
    },}, function(err, sent){
      
      req.flash('success', 'Message sent')
      res.redirect(baseurl+'/message/all')
    })
  })
}

exports.removeAll = function(req, res){
  let nim = req.session.student
  msg.update({nim:nim},{$set:{
    messages:[]
  },}, function(err, deleted){
    if(deleted){
        res.redirect(baseurl+'/message/all')
      }
    }
  )
}