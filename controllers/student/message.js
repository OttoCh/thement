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
            report.aggregate({$match:{"_id":_id}},{$unwind:"$messages"},{$match:{"messages.author":"hendro"},},
              function(err, from){
                console.log('from hendro : ', from.length)
              }            
            )
            // get all sent

            console.log("pengirim : ",objMsgs[1].from)
            let last_message = objMsgs[msgsLength-1].date_created
            console.log('last message : ', last_message)
            res.render('student/message/all', {title:"All Messages", baseurl, last_message, supervFull, objMsgs, nim,
              hideAllMsg, showInbox, showOutbox
            })
          }
        )
      })
    } else {
      console.log('please choose supervisor first')
      res.redirect(baseurl)
    }
  })
}
