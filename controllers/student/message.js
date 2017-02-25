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
  student.findOne({nim:nim}, function(err, std){
    if(std.supervisor !== "" && std.is_accepted == true){
      let superv      = std.supervisor
      lecturer.findOne({username:superv}, function(err, full){
        let supervFull = full.name
        let nimStr     = nim.toString()
        nimStr         = JSON.parse("[" + nimStr + "]")
        msg.findOne({members: {$in: ["hendro"]},},
          function(err, strs){
            let msgs        = strs.messages
            let msgsLength  = msgs.length
            let objMsgs     = []
            for(var i=0; i<msgsLength; i++){
              objMsgs.push({
                index:msgs[i].id,
                from:msgs[i].author,
                body:msgs[i].body,
                date:msgs[i].date
              })
            }
            console.log("pengirim : ",objMsgs[1].from)
            let last_message = funcs.friendlyDate(objMsgs[msgsLength-1].date)
            res.render('student/message/all', {title:"All Messages", baseurl, last_message, supervFull, objMsgs})
          }
        )
      })
    } else {
      console.log('please choose supervisor first')
      res.redirect(baseurl)
    }
  })
}
