/*
  REFACTOR :
  1. model distinguish  []
  2. async              []
*/

"use strict"

// load lecturers
var student       = require('../../models/student'),
    lecturer      = require('../../models/lecturer'),
    report        = require('../../models/report'),
    msg           = require('../../models/message'),
    admin         = require('../../models/admin'),
    funcs         = require('../../middlewares/funcs'),
    queries       = require('../../models/query.student'),
    lect_query    = require('../../models/query.lecturer'),
    multer        = require('multer')
var baseurl       = require('../../config/baseurl'),
    baseurl       = baseurl.root + 'lecturer'
const root_url= 'http://localhost:3500'

exports.getAll = function(req, res){
    let lec = req.session.lecturer
    lect_query.getLecturerByUsername(lec, function(err, found){
        if(found){
            let stds = found.students
            if(stds.length > 0){
                let objStd = []
                let allNIMS = []
                for(var j=0; j<stds.length; j++){
                    allNIMS.push({
                        id:j,
                        nim:stds[j],
                        unread:''
                    })
                }
                // CHECK IF THERE'S UNREAD MESSAGE
                lect_query.getMessageByLecturer(lec,function(err, unread){
                        let msgs = unread.length
                        // get all nim
                        let unreadNIMS = []
                        for(var i=0; i<msgs; i++){
                            unreadNIMS.push({
                                id:i,
                                nim:unread[i].nim.toString(),
                                unread:'new message'
                            })
                        }                                               
                        // SHOW ONLY READ MESSAGE
                        while (unreadNIMS.length) {
                            var nd = unreadNIMS.shift(), nam = nd.nim, vie = nd.unread;
                            if (!allNIMS.some(function(md) {
                                if (md.nim === nam) {md.unread += vie; return true;}
                            })) allNIMS.push(nd);
                        }                                        
                        // get broadcast message
                        lect_query.getBroadcastByLecturer(lec, function(err, bcsc){
                            let bcMsg = []
                            if(bcsc){
                                let bcs   = bcsc.messages
                                for(var l=0; l<bcs.length; l++){
                                    bcMsg.push({
                                    id:l+1,
                                    author:bcs[l].author,
                                    body:bcs[l].body,
                                    date_created:funcs.friendlyDate(bcs[l].date_created)
                                })
                                }
                                bcMsg.sort(function(a,b){
                                    return parseFloat(b.id) - parseFloat(a.id)
                                })
                            } else {
                                bcMsg = ''
                            }
                            res.render('lecturer/message/all', {title:"All messages", stds, allNIMS, baseurl, bcMsg})
                        })
                    }
                )
            } else {
                console.log('no students')
                res.redirect(baseurl+'/home')
            }
        }
    })
}

exports.getMsgByNIM = function(req, res){
    let lec = req.session.lecturer
    let nim = req.params.nim
    
    // query for student's last seen
    queries.getStudentByNIM(nim, function(e, std){
        let login       = std.last_login
        let last_seen   = ''
        let nickname    = std.profile.nickname
        if(login == null){
            last_seen = '1st time'
        } else {
            last_seen = funcs.friendlyDate(login)
        }
        let showInbox = 'hide', showOutbox = 'hide'
        
        // set default to inbox
        let superv = std.supervisor
        var inboxMsg = [], outboxMsg = []
        nim = Number(nim)
        lect_query.getMessageByStudent(nim, function(e, inb){
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
                    
                    // get query for outbox
                    let quer = req.query.type
                    if(quer == 'outbox'){
                        showOutbox = '', showInbox = 'hide'
                    } else {
                        showOutbox = 'hide', showInbox = ''
                    }

                    // get outbox
                    lect_query.getMessageFromLecturer(nim, superv, function(e, outb){
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
                                let nimToSet = Number(nim)
                                lect_query.seenByLecturer(nim, function(err, updated){
                                        res.render('lecturer/message/msg-nim', {title:"Message by NIM", nim, last_seen, inboxMsg, 
                                        outboxMsg, showInbox, showOutbox, nickname})
                        })
                    }
                })
            } else {
             console.log('no inbox')
            }
        })
    })
}

exports.sendMessage = function(req, res){
    let lecturer    = req.session.lecturer
    let nim         = Number(req.body.nim)
    let msgBody     = req.body.msg
    let supervisor  = req.body.supervisor 
    queries.getMessageByNIM(nim, function(e, m){
    let msgLength = m.messages.length
      if(msgLength > 0){
        msgLength = msgLength +1
      } else {
        msgLength = 0+1
      }
      lect_query.sendMessage(nim, msgLength, lecturer, msgBody, function(err){
      console.log('message sent')
      res.redirect(baseurl+'/message/all')
    })
  })
}

exports.sendToAll = function(req, res){
    let message   = req.body.msg
    let lec       = req.session.lecturer
    // get all students
    lect_query.getLecturerByUsername(lec, function(err, lect){
        let stds = lect.students
        queries.getMessageBySupervisor(lec, function(err, found){
            let bcLength = found.messages.length
            if(bcLength>0){
                bcLength = bcLength+1
            } else {
                bcLength = 0+1
            }
            lect_query.sendBroadcast(lec, bcLength, message, function(err){
                req.flash('success','Broadcast message sent!')
                res.redirect(baseurl+'/message/all')
            })
        })
    })
}

exports.getAnnouncements = function(req, res){
  let lec    = req.session.lecturer
  let lecMsg = []
  lect_query.getAllAnnouncements(function(err, lecs){
              for(var i=0; i<lecs.length; i++){
                  lecMsg.push({
                      id:lecs[i].announcements.id,
                      to:lecs[i].announcements.to,
                      body:lecs[i].announcements.body,
                      date:funcs.friendlyDate(lecs[i].announcements.date),
                      seen_by:lecs[i].announcements.seen_by
                  })
              }
              lecMsg.sort(function(a,b){
                  return parseFloat(b.id) - parseFloat(a.id)
              })
              res.render('lecturer/message/announcements', {title:"All Announcements", baseurl, lec, lecMsg})
          }
      )
  }

exports.getDetailAnnouncement = function(req, res){
  let lec             = req.session.lecturer
  let idAnnouncement  = req.params.id
  let lecMsg          = []
  lect_query.getAllAnnouncements(function(err, lecs){
      for(var i=0; i<lecs.length; i++){
          lecMsg.push({
              id:lecs[i].announcements.id,
              to:lecs[i].announcements.to,
              body:lecs[i].announcements.body,
              date:funcs.friendlyDate(lecs[i].announcements.date),
              seen_by:lecs[i].announcements.seen_by
          })
      }
      var found = lecMsg.filter(function(item){
        return item.id == idAnnouncement
      })
      found = found[0]
      // check if nim is on the seen_by array
      let msgLength = lecMsg.length
      let latestMsg = lecMsg[msgLength-1]
      let has_seen  = latestMsg.seen_by
      let idRead    = latestMsg.id
      if(has_seen.includes(lec) == false){
        // push to db
        lect_query.seenByAnnouncement(idRead, lec, function(err){
            res.render('lecturer/message/announcement-detail', {title:"Announcement detail", baseurl, found})      
        })
      } else {
        console.log('has read')
        res.render('lecturer/message/announcement-detail', {title:"Announcement detail", baseurl, found})
      }
  })
}