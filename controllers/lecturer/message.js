"use strict"

// load lecturers
var lect      = require('../../models/lecturer.model'),
    student   = require('../../models/student'),
    lecturer  = require('../../models/lecturer'),
    report    = require('../../models/report'),
    msg       = require('../../models/message'),
    funcs     = require('../../middlewares/funcs'),
    multer    = require('multer')
const baseurl = 'http://localhost:3500/lecturer'
const root_url= 'http://localhost:3500'

exports.getAll = function(req, res){
    let lec = req.session.lecturer
    lecturer.findOne({username:lec}, function(err, found){
        if(found){
            let stds = found.students
            let objStd = []
            // for(var i=0; i<stds.length; i++){
            //     objStd.push({
            //         index:i,
            //         nim:stds[i]
            //     })
            // }
            res.render('lecturer/message/all', {title:"All messages", stds})
        }
    })
}

exports.getMsgByNIM = function(req, res){
    let lec = req.session.lecturer
    let nim = req.params.nim
    console.log('tipe nim :', typeof(nim))

    // query for student's last seen
    student.findOne({nim:nim}, function(e, std){
        let last_seen = funcs.friendlyDate(std.last_login)
        let showInbox = 'hide', showOutbox = 'hide'
        
        // set default to inbox
        let superv = std.supervisor
        var inboxMsg = [], outboxMsg = []
        msg.aggregate({$match:{"nim":Number(nim)}}, {$unwind:"$messages"},
        {$match:{"messages.author":nim.toString()}},
            function(e, inb){
                if(inb){
                    // convert to array of objects
                    let inboxs  = inb
                    let inboxLen= inb.length
                    for(var i=0; i<inboxLen; i++){
                        inboxMsg.push({
                            index:i+1,
                            author:inboxs[i].messages.author,
                            body:inboxs[i].messages.body,
                            date_created:funcs.friendlyDate(inboxs[i].messages.date_created)
                        })
                    }

                    // sort by latest
                    inboxMsg.sort(function(a,b){
                        return parseFloat(b.index) - parseFloat(a.index)
                    })
                    console.log('FINAL INBOX : ', inboxMsg)

                    // get query for outbox
                    let quer = req.query.type
                    if(quer == 'outbox'){
                        showOutbox = '', showInbox = 'hide'
                    } else {
                        showOutbox = 'hide', showInbox = ''
                    }

                    // get outbox
                    msg.aggregate({$match:{"nim":Number(nim)}},{$unwind:"$messages"},{$match:{"messages.author":superv}},
                        function(e, outb){
                            if(outb){
                                // convert to array of objects
                                let outboxs   = outb
                                let outboxLen= outb.length
                                for(var i=0; i<outboxLen; i++){
                                    outboxMsg.push({
                                        index:i+1,
                                        author:"YOU",
                                        body:outboxs[i].messages.body,
                                        date_created:funcs.friendlyDate(outboxs[i].messages.date_created)
                                    })
                                }

                                // sort by latest
                                outboxMsg.sort(function(a,b){
                                    return parseFloat(b.index) - parseFloat(a.index)
                                })
                                console.log('FINAL OUTBOX : ', outboxMsg)
                                res.render('lecturer/message/msg-nim', {title:"Message by NIM", nim, last_seen, inboxMsg, outboxMsg, showInbox, showOutbox})
                            }
                        }
                    )
                } else {
                    console.log('no inbox')
                }
            }
        )
    })
}

exports.sendMessage = function(req, res){
    let lecturer    = req.session.lecturer
    let nim         = req.body.nim
    let msgBody     = req.body.msg
    let supervisor  = req.body.supervisor 
  console.log('NIM : '+ nim + ' which type is ' + typeof(nim))
  msg.findOne({nim:Number(nim)}, function(e, m){
    let msgLength = m.messages.length
      if(msgLength > 0){
        msgLength = msgLength
      } else {
        msgLength = 0
      }
      msg.update({nim:Number(nim)},{$push:{
      messages:{
        "id":msgLength+1,
        "author": lecturer,
        "body": msgBody,
        "date_created": new Date()
      }
    },}, function(err, sent){
      console.log('message sent')
      res.redirect(baseurl+'/message/all')
    })
  })
}