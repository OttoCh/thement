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

            // echo 'YOU' instead of nim
            // for(var j=0; j<objMsgs.length; j++){
            //   if(objMsgs[i].from == '10213075'){
            //     objMsgs.push({
            //       from:'YOU'
            //     })
            //     console.log('YOU : ', objMsgs)
            //   } else {
            //     objMsgs.push({
            //       from:superv
            //     })
            //     console.log("SUPERVISOR : ", objMsgs)
            //   }
            // }


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
            let last_message = objMsgs[0].date_created
            console.log('last message : ', last_message)
            res.render('student/message/all', {title:"All Messages", baseurl, last_message, supervFull, objMsgs, nim,
              hideAllMsg, showInbox, showOutbox, superv
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
        "author": nim,
        "body": msgBody,
        "date_created": new Date()
      }
    },}, function(err, sent){
      console.log('message sent')
      res.redirect(baseurl+'/message/all')
    })
  })
}
