"use strict"

// load lecturers
var lect      = require('../../models/lecturer.model'),
    student   = require('../../models/student'),
    lecturer  = require('../../models/lecturer'),
    report    = require('../../models/report'),
    msg       = require('../../models/message'),
    funcs     = require('../../middlewares/funcs'),
    multer    = require('multer')
const baseurl = 'http://localhost:3500/student'
const root_url= 'http://localhost:3500'

exports.getAll = function(req, res){
  let nim = req.session.student
  let hideAllMsg = 'hide', showInbox = 'hide', showOutbox = 'hide'
  student.findOne({nim:nim}, function(err, std){
    if(std.supervisor !== "" && std.is_accepted == true){
      let superv      = std.supervisor
      lecturer.findOne({username:superv}, function(err, full){
        let supervFull = full.name
        let nimStr     = nim.toString()
        nimStr         = JSON.parse("[" + nimStr + "]")
        msg.findOne({members: {$in: [superv]},},
          function(err, strs){
            let msgs        = strs.messages
            let _id         = strs._id
            console.log('_id : ', _id)
            // sort by the latest
            msgs.sort(function(a,b){
              return parseFloat(b.id) - parseFloat(a.id)
            })
  
            let msgsLength  = msgs.length
            let objMsgs     = []
            for(var i=0; i<msgsLength; i++){
              objMsgs.push({
                index:msgs[i].id,
                from:msgs[i].author,
                body:msgs[i].body,
                date_created:funcs.friendlyDate(msgs[i].date_created)
              })
            }

            // get query
            let quer = req.query.type
            if(quer == 'outbox'){
              showOutbox = ''
              console.log('outbox message')
            } else if(quer == 'inbox') {
              showInbox = ''
              console.log('inbox message')
            } else {
              console.log('no detected')
              hideAllMsg = ''
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

                  console.log('from hendro : ', agg.length)
                  console.log('CONVERTED INBOXES :', inboxMsg)

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
                      console.log('ALL OUTBOX : ', outboxMsg)
                      
                      // get all sent
                      let last_message = objMsgs[0].date_created
                      res.render('student/message/all', {title:"All Messages", baseurl, last_message, supervFull, objMsgs, nim,
                        hideAllMsg, showInbox, showOutbox, superv, inboxMsg, outboxMsg
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
      msg.update({nim:nim},{$push:{
      messages:{
        "id":msgLength+1,
        "author": nim.toString(),
        "body": msgBody,
        "date_created": new Date()
      }
    },}, function(err, sent){
      console.log('message sent')
      res.redirect(baseurl+'/message/all')
    })
  })
}
