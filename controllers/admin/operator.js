"use strict"

var express       = require('express'),
    funcs         = require('../../middlewares/funcs'),
    adm_query     = require('../../models/query.admin'),
    Std           = require('../../models/student'),
    Lect          = require('../../models/lecturer'),
    Admin         = require('../../models/admin'),
    app           = express()

var baseurl       = require('../../config/baseurl'),
    root_url      = baseurl.root,
    baseurl       = baseurl.root + 'operator'

exports.getHome = function(req, res){
    let admin = req.session.admin
  if(admin){
    adm_query.getAdminByRole(admin, function(e, a){
      // count all lecturers
          adm_query.countLecturers(function(e, lecturers){
            let nLects = lecturers
            // get all lecturers that have student
            adm_query.countLecturerHasStd(function(err, std){
                let lectHasStd = (std/nLects) * 100
                lectHasStd     = lectHasStd.toFixed(2)
              // count all students
              adm_query.countStudents(function(e, all){
                let nStd = all
                // count student where is_accepted is true
              adm_query.countStudentHasLecturer(function(e, count){
                let nAccepted = count
                let precenAccept = (nAccepted/nStd) * 100
                precenAccept     = precenAccept.toFixed(2)
                res.render('admin/operator/home', {title:"Dashboard", admin, a, nStd, nAccepted, precenAccept, nLects, std, 
                lectHasStd})
              })
            })
          })
        })
      })
  } else {
    console.log('UNAUTHORIZED ACCESS!')
    res.redirect('./login')
  }
}

exports.postLogout = function(req, res){
  req.session.destroy(function(err){
    if(err){
        console.log(err);
    } else {
        res.redirect(baseurl)
    }
  });
}

exports.getStudents = function(req, res){
  let admin = req.session.admin
  adm_query.getAllStudents(function(err, students){
    let allStds = students
    let stds = []
    for(var i=0; i<students.length; i++){
      if(students[i].ta1 != ""){
        let ta1status = students[i].ta1.status
          switch(ta1status){
            case 'waiting':
              stds.push({
                    nim:students[i].nim,
                    fullname:students[i].profile.fullname,
                    nickname:students[i].profile.nickname,
                    ipk:students[i].ipk,
                    last_seen:funcs.friendlyDate(students[i].last_login),
                    email:students[i].email,
                    ta1:'NEW',
                    ta2:'nothing',
                    notifta1:'important',
                    notifta2:'default'
                  })
            break;

            case 'verified':
              if(students[i].ta2 != ""){
                let ta2status = students[i].ta2.status
                switch(ta2status){
                case 'waiting':
                  stds.push({
                    nim:students[i].nim,
                    fullname:students[i].profile.fullname,
                    nickname:students[i].profile.nickname,
                    ipk:students[i].ipk,
                    last_seen:funcs.friendlyDate(students[i].last_login),
                    email:students[i].email,
                    ta1:'VERIFIED',
                    ta2:'NEW',
                    notifta1:'success',
                    notifta2:'important'
                  })
                break;

                case 'verified':
                  stds.push({
                    nim:students[i].nim,
                    fullname:students[i].profile.fullname,
                    nickname:students[i].profile.nickname,
                    ipk:students[i].ipk,
                    last_seen:funcs.friendlyDate(students[i].last_login),
                    email:students[i].email,
                    ta1:'VERIFIED',
                    ta2:'VERIFIED',
                    notifta1:'success',
                    notifta2:'success'
                  })
                break;
              }
              } else {
                stds.push({
                  nim:students[i].nim,
                  fullname:students[i].profile.fullname,
                  nickname:students[i].profile.nickname,
                  ipk:students[i].ipk,
                  last_seen:funcs.friendlyDate(students[i].last_login),
                  email:students[i].email,
                  ta1:'VERIFIED',
                  ta2:'nothing',
                  notifta1:'success',
                  notifta2:'default'
                })
              }
            break;
          }
      } else {
        stds.push({
          nim:students[i].nim,
          fullname:students[i].profile.fullname,
          nickname:students[i].profile.nickname,
          ipk:students[i].ipk,
          last_seen:funcs.friendlyDate(students[i].last_login),
          email:students[i].email,
          ta1:'nothing',
          ta2:'nothing',
          notifta1:'default',
          notifta2:'default'
        })
      } 
    }
    res.render('admin/operator/students', {title:"All students", allStds, stds, admin})
  })
}

exports.getDetailStudent = function(req, res){
  let nim = req.params.nim
  let admin = req.session.admin
  adm_query.getStudentByNIM(nim, function(err, found){
    let ta1Button = 'hide', ta1Message = '', ta2Button = 'hide', ta2Message = ''
    let profile = found
    let ta1 = found.ta1
    let ta2 = found.ta2
    if(ta1 != ""){
      let ta1status = ta1.status
      switch(ta1status){
        case 'waiting':
          ta1Message = 'waiting for verification', ta1Button = ''
        break;

        case 'verified':
          ta1Message = 'verified'
          if(ta2 != ""){
            let ta2status = ta2.status
            switch(ta2status){
              case 'waiting':
                ta2Button = ''
              break;

              case 'verified':
                ta2Message = 'verified'
              break;
            }
          } else {
            ta2Message = 'unknown'
          }
        break;
      }
    } else {  
      ta1Message = 'not yet'
    }
    res.render('admin/operator/student-detail', {title:"Student detail", baseurl, profile, ta1Button, ta1Message, ta2Button, ta2Message})
  })
}

exports.getLecturers = function(req, res){
  adm_query.getAllLecturers(function(err, lect){
    let lects = lect
    res.render('admin/operator/lecturers', {title:"All lecturers", lects})
  })
}

exports.getDetailLecturer = function(req, res){
  let username = req.params.username
  adm_query.getLecturerByUsername(username, function(err, detail){
    let profile = detail
    res.render('admin/operator/lecturer-detail',{title:"Lecturer detail", username, profile, baseurl})    
  })
}

// announcement
exports.getAnnouncements = function(req, res){
    let admin = req.session.admin
    let quer  = req.query.type
    let showStd = 'hide', showLecturers = 'hide', showAll = ''
    switch(quer){
        case 'students' : showStd = '', showLecturers = 'hide', showAll = 'hide'
        break;

        case 'lecturers': showLecturers = '', showStd = 'hide', showAll = 'hide'
        break;

        default:
        break;
    }
    // fetch db
    Admin.findOne({role:admin}, function(err, ann){
        let message   = ann.announcements
        let annLength = ann.announcements.length
        let allMsg    = []
        let stdMsg    = []
        let lecMsg    = []
        if(annLength>0){
            // get all
            for(var i=0; i<annLength; i++){
                allMsg.push({
                    id:message[i].id,
                    to:message[i].to,
                    body:message[i].body,
                    date:funcs.friendlyDate(message[i].date),
                    seen_by:message[i].seen_by.length
                })
                allMsg.sort(function(a,b){
                    return parseFloat(b.id) - parseFloat(a.id)
                })
            }

            // get students
            Admin.aggregate({$match:{"role":admin}},{$unwind:"$announcements"},{$match:{"announcements.to":"students"}},
                function(err, stds){
                    // convert two objects to one array of objects
                    for(var j=0; j<stds.length; j++){
                        stdMsg.push({
                            id:stds[j].announcements.id,
                            to:stds[j].announcements.to,
                            body:stds[j].announcements.body,
                            date:funcs.friendlyDate(stds[j].announcements.date),
                            seen_by:stds[j].announcements.seen_by.length
                        })
                    }
                    stdMsg.sort(function(a,b){
                        return parseFloat(b.id) - parseFloat(a.id)
                    })
                    

                    // get lecturers
                    Admin.aggregate({$match:{"role":admin}},{$unwind:"$announcements"},{$match:{"announcements.to":"lecturers"}},
                        function(err, lecs){
                            for(var k=0; k<lecs.length; k++){
                                lecMsg.push({
                                    id:lecs[k].announcements.id,
                                    to:lecs[k].announcements.to,
                                    body:lecs[k].announcements.body,
                                    date:funcs.friendlyDate(lecs[k].announcements.date),
                                    seen_by:lecs[k].announcements.seen_by.length
                                })
                            }
                            lecMsg.sort(function(a,b){
                                return parseFloat(b.id) - parseFloat(a.id)
                            })
                            console.log('lecturer message : ', lecMsg)
                            res.render('admin/announcement/all', {title:"All announcements", baseurl, showStd, showLecturers, showAll, allMsg,
                                stdMsg, lecMsg
                            })
                        }
                    )
                }
            )
        } else {
            console.log('no announcements')
            res.render('admin/announcement/all', {title:"All announcements", baseurl, showStd, showLecturers, showAll, allMsg,
                stdMsg, lecMsg
            })
        }
    })
}

exports.sendNewAnnouncement = function(req, res){
    let admin  = req.session.admin
    let result = req.body.to
    let body   = req.body.msg
    // count announcements
    Admin.findOne({role:admin}, function(err, ann){
        let sumAnns = ann.announcements.length
        switch(result){
        case 'all':
            // add to db
            Admin.update({role:admin}, {$push:{
                "announcements":{
                    "id":sumAnns+1,
                    "to":result,
                    "body":body,
                    "date": new Date(),
                    "seen_by":[]
                }
            },}, function(err){
                if(!err){
                    console.log('announcement send to ', result)
                }
            })
        break;

        case 'students':
            // add to db
            Admin.update({role:admin}, {$push:{
                "announcements":{
                    "id":sumAnns+1,
                    "to":result,
                    "body":body,
                    "date": new Date(),
                    "seen_by":[]
                }
            },}, function(err){
                if(!err){
                    console.log('announcement send to ', result)
                }
            })
        break;

        case 'lecturers':
            // add to db
            Admin.update({role:admin}, {$push:{
                "announcements":{
                    "id":sumAnns+1,
                    "to":result,
                    "body":body,
                    "date": new Date(),
                    "seen_by":[]
                }
            },}, function(err){
                if(!err){
                    console.log('announcement send to ', result)
                }
            })
        break;

        default:
        break;
    }
    req.flash('success', 'Message send to '+result)
    res.redirect(baseurl+'/announcements/all')
    })
}

// ta1 & ta2 confirmation

exports.verifyTa1 = function(req, res){
  let nim = req.params.nim
  Std.findOne({nim:nim}, function(err, std){
    let superv = std.supervisor
      Std.update({nim:nim},{$set:{
      ta1:{
        "status":"verified",
        "date": new Date(),
        "supervisor":superv
      }
    },}, function(err, ta){
      if(ta){
        console.log('success verify ta1')
      }
      res.redirect(baseurl+'/student/'+nim)
    })
  })
}

exports.verifyTa2 = function(req, res){
  let nim = req.params.nim
  Std.findOne({nim:nim}, function(err, std){
    let superv = std.supervisor
      Std.update({nim:nim},{$set:{
      ta2:{
        "status":"verified",
        "date": new Date(),
        "supervisor":superv
      }
    },}, function(err, ta){
      if(ta){
        console.log('success verify ta2')
      }
      res.redirect(baseurl+'/student/'+nim)
    })
  })
}