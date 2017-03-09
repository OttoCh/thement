"use strict"

// load lecturers
var lect          = require('../../models/lecturer.model'),
    student       = require('../../models/student'),
    lecturer      = require('../../models/lecturer'),
    report        = require('../../models/report'),
    msg           = require('../../models/message'),
    funcs         = require('../../middlewares/funcs'),
    multer        = require('multer')
var baseurl       = require('../../config/baseurl'),
    baseurl       = baseurl.root + 'lecturer'
const root_url= 'http://localhost:3500'

exports.getAll = function(req, res){
    let lec = req.session.lecturer
    lecturer.findOne({username:lec}, function(err, found){
        if(found){
            let stds = found.students
            console.log('all nims early : ', stds)
            let objStd = []
            let allNIMS = []
            for(var j=0; j<stds.length; j++){
                allNIMS.push({
                    id:j,
                    nim:stds[j],
                    unread:''
                })
            }
            console.log('All NIMS : ', allNIMS)

            // CHECK IF THERE'S UNREAD MESSAGE
            msg.find({members:{$all:[lec]}, $and:[{has_seen_lecturer:false}]},
                function(err, unread){
                    let msgs = unread.length
                    console.log('very initial : ', unread)
                    // get all nim
                    let unreadNIMS = []
                    for(var i=0; i<msgs; i++){
                        unreadNIMS.push({
                            id:i,
                            nim:unread[i].nim,
                            unread:'new unread message'
                        })
                    }
                    console.log('initial UNREAD ', unreadNIMS)

                    // SHOW ONLY READ MESSAGE
                    while (unreadNIMS.length) {
                        var nd = unreadNIMS.shift(), nam = nd.id, vie = nd.unread;
                        if (!allNIMS.some(function(md) {
                            if (md.id === nam) {md.unread += vie; return true;}
                        })) allNIMS.push(nd);
                    }

                    // check if initial broadcast found
                    let bc = 'hide'
                    msg.findOne({lecturer:lec},function(err, broadcast){
                        if(!broadcast){
                            bc = '' 
                            res.render('lecturer/message/all', {title:"All messages", stds, allNIMS, baseurl, bc})
                        } else {
                            bc = 'hide'
                            console.log('final UNREAD : ', allNIMS)
                            res.render('lecturer/message/all', {title:"All messages", stds, allNIMS, baseurl, bc})
                        }
                    })
                }
            )
        }
    })
}

exports.getMsgByNIM = function(req, res){
    let lec = req.session.lecturer
    let nim = req.params.nim
    console.log('tipe nim :', typeof(nim))

    // query for student's last seen
    student.findOne({nim:nim}, function(e, std){
        let login = std.last_login
        let last_seen = ''
        if(login == null){
            last_seen = '1st time'
        } else {
            last_seen = funcs.friendlyDate(login)
        }
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

                                // SET has_seen_lecturer to TRUE
                                let nimToSet = Number(nim)
                                msg.update({nim:nim},{$set:{
                                    has_seen_lecturer: true
                                },}, function(err, updated){
                                        console.log('FINAL OUTBOX : ', outboxMsg)
                                        res.render('lecturer/message/msg-nim', {title:"Message by NIM", nim, last_seen, inboxMsg, outboxMsg, showInbox, showOutbox})
                                    }
                                )
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
      // ADD MESSAGE NOTIF TO STUDENT
      msg.update({nim:Number(nim)},{$set:{
          has_seen_std:false
      },$push:{
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

exports.initBroadcast = function(req, res){
    let lec = req.session.lecturer
    lecturer.findOne({username:lec}, function(err, lect){
        let members = lect.students
        members.push(lecturer)
        var b           = new msg()
        b.lecturer      = lec
        b.members       = members
        b.save(function(err){
            if(!err){
                console.log('init broadcast success!')
                res.redirect(baseurl)
            }
        })
    })
}

exports.sendToAll = function(req, res){
    let message   = req.body.msg
    let lec       = req.session.lecturer
    // get all students
    lecturer.findOne({username:lec}, function(err, lect){
        let stds = lect.students
        msg.findOne({lecturer:lec},function(err, found){
            let bcLength = found.messages.length
            if(bcLength>0){
                bcLength = bcLength
            } else {
                bcLength = 0
            }
            msg.update({lecturer:lec},{$set: {
                has_seen_by: []
            },
            $push:{
                messages:{
                    "id":bcLength+1,
                    "author": lec,
                    "body": message,
                    "date_created": new Date()
                }
            },}, function(err,sent){
                console.log('broadcast sent')
                if(sent){
                    req.flash('success','Broadcast message sent!')
                    res.redirect(baseurl+'/message/all')
                }
            }
          )
        })
    })
}