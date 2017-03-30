/*
  REFACTOR :
  1. model distinguish  [-]
  2. async              []
*/

"use strict"

// load lecturers
var admin     = require('../../models/admin'),
    funcs     = require('../../middlewares/funcs'),
    queries   = require('../../models/query.student'),
    lect      = require('../../models/query.lecturer'),
    multer    = require('multer')

var baseurl       = require('../../config/baseurl'),
    baseurl       = baseurl.root + 'student'

const root_url= 'http://localhost:3500'

exports.getAll = function(req, res){
  let nim = req.session.student
  let hideAllMsg = 'hide', showInbox = 'hide', showOutbox = 'hide', showBroadcast = 'hide'
  queries.getStudentByNIM(nim, function(err, std){
    if(std.supervisor !== "" && std.is_accepted == true){
      let username      = std.supervisor
      lect.getLecturerByUsername(username, function(err, full){
        let supervFull = full.name
        let last_seen  = funcs.friendlyDate(full.last_login)
        let nimStr     = nim.toString()
        nimStr         = JSON.parse("[" + nimStr + "]")
        queries.getAllMessages(nim, function(err, strs){
          let msgs     = strs.messages
          let _id      = strs._id
            
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
            queries.aggregateInbox(nim, username, function(err, agg){
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

                  // get the latest
                  inboxMsg.sort(function(a,b){
                    return parseFloat(b.index) - parseFloat(a.index)
                  })  
                  
                  // get all outbox
                  let nimStr = nim.toString()
                  var outboxMsg = []
                  queries.aggregateOutbox(nim, nimStr,function(err, out){
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
                      queries.updateHasSeen(nim, function(e, cb){
                        if(cb){

                          // get all broadcast
                          queries.getAllBroadcast(username, function(err, bc){
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
                            hideAllMsg, showInbox, showOutbox, username, inboxMsg, outboxMsg, showBroadcast, bcMsg,
                            newBC, last_seen
                          })
                      })
                        } else {
                          
                        }
                      }) 
                    } else {
                      
                    }
                  })
                }
              })
          })
      })
    } else {
      res.redirect(baseurl)
    }
  })
}

exports.getDetailBroadcast = function(req, res){
  let bc_id = req.params.id
  let nim   = req.session.student
  
  let nimstr = nim.toString()
  queries.getStudentByNIM(nim, function(err,std){
    let username = std.supervisor
    lect.getLecturerByUsername(username, function(err, found){
      let last_seen   = funcs.friendlyDate(found.last_login)
      let supervFull  = found.name
    queries.getAllBroadcast(username, function(err, bc){
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
             queries.seenBy(username, bc_id, nimstr, function(err, seen){
              res.render('student/message/bc-detail',{title:"Broadcast detail", baseurl, found, timeBC, other, nim, supervFull, last_seen})
            })
           } else {
             res.render('student/message/bc-detail',{title:"Broadcast detail", baseurl, found, timeBC, other, nim, supervFull, last_seen})
           }
        } else {
          res.redirect(baseurl)
        }
      })
    })
  })
}

exports.sendMessage = function(req, res){
  let nim         = req.session.student
  let msgBody     = req.body.msg
  let supervisor  = req.body.supervisor
  queries.getAllMessages(nim, function(e, m){
    let msgLength = m.messages.length
      if(msgLength > 0){
        msgLength = msgLength+1
      } else {
        msgLength = 0
      }
      queries.sendMessage(nim, msgLength, msgBody, function(err, sent){
      req.flash('success', 'Message sent')
      res.redirect(baseurl+'/message/all')
    })
  })
}

exports.removeAll = function(req, res){
  let nim = req.session.student
  queries.removeAllMessages(nim, function(err, deleted){
    if(deleted){
        res.redirect(baseurl+'/message/all')
      }
    }
  )
}

exports.getAnnouncements = function(req, res){
  let nim = req.session.student
  let stdMsg = []
  queries.getAllAnnouncements(function(err, stds){
          for(var i=0; i<stds.length; i++){
              stdMsg.push({
                  id:stds[i].announcements.id,
                  to:stds[i].announcements.to,
                  body:stds[i].announcements.body,
                  date:funcs.friendlyDate(stds[i].announcements.date),
                  seen_by:stds[i].announcements.seen_by
              })
          }
          stdMsg.sort(function(a,b){
              return parseFloat(b.id) - parseFloat(a.id)
          })
          res.render('student/message/announcements', {title:"All Announcements", baseurl, nim, stdMsg})
      }
    )
  }

exports.getDetailAnnouncement = function(req, res){
  let nim             = req.session.student
  let idAnnouncement  = req.params.id
  let stdMsg          = []
  queries.getAllAnnouncements(function(err, stds){
      for(var i=0; i<stds.length; i++){
          stdMsg.push({
              id:stds[i].announcements.id,
              to:stds[i].announcements.to,
              body:stds[i].announcements.body,
              date:funcs.friendlyDate(stds[i].announcements.date),
              seen_by:stds[i].announcements.seen_by
          })
      }
      var found = stdMsg.filter(function(item){
        return item.id == idAnnouncement
      })
      found = found[0]
      // check if nim is on the seen_by array
      let msgLength = stdMsg.length
      let latestMsg = stdMsg[msgLength-1]
      let has_seen  = latestMsg.seen_by
      let idRead    = latestMsg.id
      if(has_seen.includes(nim) == false){
        queries.seenByAnnouncement(idRead, nim, function(err, add){
            res.render('student/message/announcement-detail', {title:"Announcement detail", baseurl, nim, found})      
        })
      } else {
        // nothing to push
        res.render('student/message/announcement-detail', {title:"Announcement detail", baseurl, nim, found})
      }
  })
}

function sendError(res, err){
  res.redirect(baseurl)
}