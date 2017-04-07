/*
  REFACTOR :
  1. model distinguish  [-]
  2. async              []
*/

"use strict"

var Lect        = require('../../models/lecturer'),
    Student     = require('../../models/student'),
    Std         = require('../../models/student.model'),
    Adm         = require('../../models/admin'),
    Msg         = require('../../models/message'),
    funcs       = require('../../middlewares/funcs'),
    report      = require('../../models/report'),
    queries     = require('../../models/query.student'),
    lect_query  = require('../../models/query.lecturer')

var baseurl       = require('../../config/baseurl'),
    baseurl       = baseurl.root + 'lecturer'

exports.getIndex = function(req, res){
  res.redirect('lecturer/login')
}

exports.getLoginPage = function(req, res){
  res.render('lecturer/login', {title:"Lecturer login page", baseurl})
}

exports.getForgetPassPage = function(req, res){
  res.render('lecturer/forget-pass', {title:"Forget password", baseurl})
}

exports.getErrorAccept = function(req, res){
  res.render('lecturer/error-accept', {title:"Error accept student", baseurl})
}

exports.getHome = function(req, res){
  let cans = 'hide'
  let stds = 'hide'
  let lecturer  = req.session.lecturer
  let colored, isNotifShow = 'hide', newNotif
  lect_query.getLecturerByUsername(lecturer, function(e, found){
    if(found){
      // check candidates
      let candids
      let weight = found.std_weight
      if(found.candidates.length > 0){
        cans = ''
        candids = found.candidates
        if(candids > 2){
          candids = candids.slice(0,2)
        } else {
          candids = candids
        }
      } else {
        cans = 'hide'
      }

      // check students
      var fixstds
      if(found.students.length > 0){
        stds = ''
        let fixLength = found.students.length
        fixstds = found.students
        if(fixLength > 2){
          fixstds = fixstds.slice(0,2)
          
        } else {
          fixstds = fixstds
        }
      } else {
        stds = 'hide'
      }
      
      let msgAlert = '', hiding = ''
      // check if newpass !== ""
      if(found.newpass !== ""){
        hiding = 'hide'
      } else {
        msgAlert = 'red'
      }

      let notifs = found.notifs
      let n      = notifs.length
      // get latest 3 notifs
      
      notifs.sort(function(a,b){
        return parseInt(b.id) - parseInt(a.id)
      })      
      let objNotifs = []
      if(n > 0){
        if(n < 3){
            // show all
            for(var i=0; i<n; i++){
            objNotifs.push({
              index:notifs[i].id,
              notif:notifs[i].notif,
              date:funcs.friendlyDate(notifs[i].date)
            })
          }
        } else {
             // show only 3
              for(var i=0; i<3; i++){
              objNotifs.push({
              index:notifs[i].id,
              notif:notifs[i].notif,
              date:funcs.friendlyDate(notifs[i].date)
            })
          }
        }
      } else {
        notifs = ''
      }

      // alert notif
      if(found.notif_seen == false){
        colored = '#b3d9ff', isNotifShow = '', newNotif = 'NEW'
      } else {
        colored = '', isNotifShow = 'hide'
      }

      // ANNOUNCEMENT CHECKING
      let lecMsg  = []
      let showAnn = 'hide'
      lect_query.getAllAnnouncements(function(err, anns){
          if(anns.length > 0){
          for(var m=0; m<anns.length; m++){
            lecMsg.push({
              id:anns[m].announcements.id,
              body:anns[m].announcements.body,
              seen_by:anns[m].announcements.seen_by
            })
          }
          
          let latestMsg = lecMsg[anns.length-1]
          let has_seen  = latestMsg.seen_by 
          
          // check if latest message has read by nim
          if(has_seen.includes(lecturer) == true){
            showAnn = 'hide'
          } else {
            showAnn = ''
          }
          } else {

          }
      lect_query.getMessageByLecturer(lecturer, function(err, matched){
          if(matched){
            // CHECK IF LENGTH > 0
          let docs = matched
          let coloredMsg = '', showMsgNotif = 'hide', newMsg = '', contentMsg = ''
          if(matched.length > 0){
            coloredMsg = '#F6E18E', showMsgNotif = '', newMsg = 'NEW', contentMsg = 'New message!'
          } else {
            coloredMsg = '', showMsgNotif = 'hide', newMsg = '', contentMsg = ''
          }
          res.render('lecturer/home', {title: "Home", baseurl, found, hiding, 
          msgAlert, stds, cans, colored, isNotifShow, newNotif, coloredMsg, showMsgNotif, newMsg,
            fixstds, candids, contentMsg, showAnn, objNotifs, weight})
          } else {
            console.log('error fetch message')
          }
        })
      })
    } else {
      console.log('no lecturer found')
    }
  })
}

exports.getCandidates = function(req, res){
  let lecturer = req.session.lecturer
  lect_query.getLecturerByUsername(lecturer, function(e, f){
      let cans    = []
      let calons  = f.candidates
      for(var i=0; i<calons.length; i++){
        cans.push({
          index:i,
          nim:calons[i]
        });
      }
    res.render('lecturer/candidates', {title:"All candidates", baseurl, cans, f})
  })
}

exports.getDetailCandidate = function(req, res){
  let student = req.params.nim
  queries.getStudentByNIM(student, function(err, student){
    res.render('lecturer/candidate-detail', {title:"Candidate detail", baseurl, student})
  })
}

exports.rejectCandidate = function(req, res){
  let lecturer    = req.session.lecturer
  let nimToRemove = req.params.nim
  let reason      = req.body.rejectReason
  if(reason == ""){
    reason = ''
  } else {
    reason = " because : " + reason
  }
  lect_query.removeCandidate(lecturer, nimToRemove, function(e, s){
    nimToRemove = Number(nimToRemove)
    let nim     = nimToRemove
    queries.getStudentByNIM(nimToRemove, function(e, found){
      let n       = found.notifs.length,
      notifLength = n+1,
      msg         = 'You are rejected by ' + lecturer + ' ' + reason
      queries.removedFromCandidates(nimToRemove, function(err){
        queries.addNotif(nim, notifLength, msg, function(err){
          req.flash('success', 'User rejected')
          res.redirect(baseurl+'/candidates')
        })
      })
    })
  })
}

exports.acceptCandidate = function(req, res){
  let lecturer    = req.session.lecturer
  let lec         = lecturer
  let nimToAccept = req.params.nim
  let weight      = 0 
  // check for student's weight
  let nimStr      = req.params.nim.toString()
  String.prototype.startsWith = function(str){
    return (this.indexOf(str) === 0)
  }
  switch(true){
    case nimStr.startsWith('102'): console.log('sarjana'), weight = 1
    break;
    
    case nimStr.startsWith('202'): console.log('magister'), weight = 2
    break;
    
    case nimStr.startsWith('302'): console.log('doctoral'), weight = 3
    break;

    case nimStr.startsWith('902'): console.log('teaching master'), weight = 2
    break;
    
    default: console.log('tidak terdeteksi')
    break;
  }
  lect_query.getLecturerByUsername(lecturer, function(err, we){
    let init_we = we.std_weight
    // check if std_weight is less than or equal 12
    let final_we  = init_we + weight
    if(final_we <= 12){
    lect_query.acceptStudent(lecturer, final_we, nimToAccept, function(err){
        // remove nim from 'candidates' field
        let nimToRemove = nimToAccept
        let username    = lecturer
        lect_query.removeCandidate(username, nimToRemove, function(err){
          // change status is_accepted to true
          nimToAccept = Number(nimToRemove)
          queries.acceptedByLecturer(nimToAccept, function(err){
            let nim = nimToAccept
            queries.getStudentByNIM(nim, function(e, f){
              let n       = f.notifs.length,
              nMiles      = f.milestones.length,
              notifLength = n+1,
              msg         = 'You are accepted by ' + lecturer
              // add notif
              queries.addNotif(nim, notifLength, msg, function(err){
                  // add milestone
                  let category = 'accepted',
                  milesLength  = nMiles+1
                    queries.addMilestone(nim, category, milesLength, function(err){  
                    let supervisor = f.supervisor
                    // create initial report
                    var rep         = new report()
                    rep.nim         = nimToAccept
                    rep.supervisor  = supervisor
                    rep.is_create   = false
                    rep.is_approved = false
                    rep.save(function(err){
                      // create initial message between lecturer and student
                      var m               = new Msg()
                      m.nim               = nimToAccept
                      m.members           = [lecturer,nimToAccept.toString()]
                      m.has_seen_std      = true
                      m.has_seen_lecturer = true
                      m.save(function(err){
                        if(err){
                          console.log('Error! ', err)
                        } else {
                            // BROADCAST MESSAGE
                            lect_query.getLecturerByUsername(username, function(err, lect){
                              // check if document exist
                              lect_query.getBroadcastByLecturer(lecturer, function(err, exist){
                                let nimToAdd = nimToAccept.toString()
                                if(exist){
                                  console.log('bc exist!')
                                  // update
                                  lect_query.updateBroadcast(lecturer, nimToAdd, function(err, bc){
                                  res.redirect(baseurl+'/candidates')
                                })
                            } else {
                              // create new document
                              let members = lect.students
                              var b           = new Msg()
                              b.lecturer      = lec
                              b.members       = members
                              b.save(function(err){
                                if(!err){
                                    console.log('init broadcast success!')
                                    res.redirect(baseurl+'/candidates')
                                }
                             })
                            }
                          })
                        }) 
                      }
                    })
                  })  
                })
              })
            })            
          })
        })
      })
    } else {
      // can't accept candidates any more
      req.flash('error', 'You has no space left for student!')
      res.redirect(baseurl+'/candidates/accept_error')
    }
  })
}

exports.getFixStudents = function(req, res){
  let lecturer = req.session.lecturer,
      username = lecturer
  lect_query.getLecturerByUsername(username, function(err, f){
    let stds    = []
    let std     = f.students
    let intStds = std.map(Number)
    // get fullname and nickname
    queries.getStudentProfile(intStds, function(err, found){   
      for(var j=0; j<found.length; j++){
        if(found[j].report_status == true){
            stds.push({
              nim:found[j].nim,
              fullname:found[j].profile.fullname,
              nickname:found[j].profile.nickname,
              ipk:found[j].ipk,
              report_status:'NOTHING NEW',
              notif:'default'
            })
        } else {
            if(found[j].milestones.length >= 3 && found[j].report_status == false){
              stds.push({
                nim:found[j].nim,
                fullname:found[j].profile.fullname,
                nickname:found[j].profile.nickname,
                ipk:found[j].ipk,
                report_status:'NEW REPORT!',
                notif: 'important'
              })
          } else {
              stds.push({
                nim:found[j].nim,
                fullname:found[j].profile.fullname,
                nickname:found[j].profile.nickname,
                ipk:found[j].ipk,
                report_status:'NOTHING NEW',
                notif:'default'
              })
            }
          }
        }
      res.render('lecturer/students', {title:"Fix students", baseurl, stds, f})
    })
  })
}

exports.postLogin = function(req, res){
  let user    = req.body.username
  let pass    = req.body.password,
      username= user
  lect_query.getLecturerByUsername(username, function(e, found){
    if(!found){
      res.redirect('#')
    } else {
      if(found.newpass !== ""){
        // check if newpass is correct
        if(pass == funcs.decryptTo(found.newpass)){
          req.session.lecturer = user
          res.redirect(baseurl+'/home')
        } else {
          res.redirect('#')
        }
      } else {
        if(pass == found.oldpass){
          req.session.lecturer = user
          res.redirect(baseurl+'/home')
        } else {
          res.redirect('#')
        }
      }
    }
  })
}

exports.postLogout = function(req, res){
  let lecturer  = req.session.lecturer,
      username  = lecturer
  req.session.destroy(function(err){
    if(err){
        console.log(err);
    } else {
        lect_query.updateLastLogin(username, function(e, u){
            res.redirect('./login')
        })
      }
  })
}

exports.getDetailStudent = function(req, res){
  let param       = req.params.nim
  let lect        = req.session.lecturer
  queries.getStudentByNIM(param, function(e, std){
    let profile   = std, last_seen
    let ta1       = std.ta1,
        ta2       = std.ta2
    // check if student ever login
    if(std.last_login != null){
      last_seen = funcs.friendlyDate(std.last_login)
    } else {
      last_seen = 'Never'
    }
    queries.getReportbyNIM(param, function(e, report){
      if(report){
        let showAccept = 'hide', showTA1 = 'hide', showTA2 = 'hide', 
        showTA1status = 'hide', showTA2status = 'hide', ta1Msg = '', ta2Msg = '', badgeTa1 = '', badgeTa2 = ''
        let objReports = []
        let reps = report.reports
        let approval = report.is_approved
        
        
        if(approval == true || reps.length == 0){
          showAccept = 'hide' 
        } else {
          showAccept = ''
        }

        if(reps.length > 0){
          if(ta1 != ""){
            // check status ta1
            let ta1Status = ta1.status
            let ta2Status = ta2.status
            switch(ta1Status){
              case 'waiting': showTA1status = '', ta1Msg = 'waiting', badgeTa1 = 'badge-important'
              break;

              case 'verified': showTA1status = '', ta1Msg = 'verified', showTA2 = '', badgeTa1 = 'badge-success'
                if(ta2 != ""){
                  switch(ta2Status){
                    case 'waiting': showTA2status = '', ta2Msg = 'waiting', showTA2 = 'hide', badgeTa2 = 'badge-important'
                    break;

                    case 'verified': showTA2status = '', ta2Msg = 'verified', badgeTa2 = 'badge-success', showTA2 = 'hide'
                    break;

                    default: showTA2status = '', ta2Msg = 'unknown'
                    break;
                  }
                } else {
                  showTA2 = ''
                }
                break;

              default: showTA1status = '', ta1Msg = 'unknown'
              break;
            }
          } else if(ta1 == '') {
            showTA1 = ''
          } else {

          }
        } else {
          
        }

        ta1Msg = ta1Msg.toUpperCase()
        ta2Msg = ta2Msg.toUpperCase()

        if(reps.length > 0){
          console.log('there is ONE OR MORE report', reps.length)
        } else {
          console.log('NO REPORT', reps.length)
        }

        for(var i=0; i<reps.length; i++){
          if(reps[i].approved != ""){
            objReports.push({
              index: reps[i].id,
              title: reps[i].title,
              body: reps[i].body,
              last_edit: funcs.friendlyDate(reps[i].last_edit),
              approved: funcs.friendlyDate(reps[i].approved),
              file_location: reps[i].file_location,
              file_name: reps[i].file_name,
              badge: 'default'
            })
          } else {
            objReports.push({
              index: reps[i].id,
              title: reps[i].title,
              body: reps[i].body,
              last_edit: funcs.friendlyDate(reps[i].last_edit),
              approved:"not yet approved",
              file_location: reps[i].file_location,
              file_name: reps[i].file_name,
              badge: 'important'
            })
          }
        }

        let input = []
        for(var n=0; n<objReports.length; n++){
          input.push({
            id: objReports[n].index,
            title: objReports[n].title,
            body: objReports[n].body,
            last_edit: objReports[n].last_edit,
            approved: objReports[n].approved
          })
        }
        // show latest report if not approved, yet
        let latestReport, showLatestReport = 'hide'
        if(report.is_create == true && report.is_approved == false){
          // show latest report
          latestReport = objReports[objReports.length-1]
          showLatestReport = ''
        } else {
          latestReport = ''
        }
        var output = input.map(function(obj) {
          return Object.keys(obj).sort().map(function(key) { 
            return obj[key];
          });
        })
        res.render('lecturer/student-detail', {title:"Student detail", baseurl, last_seen, profile,
          objReports, showAccept, showTA1, showTA2, showTA1status, ta1Msg, showTA2status, ta2Msg,
          badgeTa1, badgeTa2, output, lect, latestReport, showLatestReport
        })
      }
    })
  })
}

exports.acceptStudentReport = function(req, res){
  let lecturer = req.session.lecturer
  let url   = req.url
  let nims  = url.split('/')
  let nim   = Number(nims[3])
  lect_query.approveReport(nim, function(e, accepted){
  queries.getReportbyNIM(nim, function(e,r){
    let reportID = r.reports.length
    queries.getStudentByNIM(nim, function(err, std){
    let notifLength = std.notifs.length+1,
                msg = 'Your report #'+reportID+' had approved by your supervisor'
        queries.updateReportStatus(nim, function(err){    
          queries.addNotif(nim, notifLength, msg, function(err){      
            reportID = reportID.toString()
              queries.approvedAt(nim, reportID, function(err){      
                res.redirect(baseurl+'/students')      
            })   
          })
        })
      })
    })
  })
} 

exports.getProfile = function(req, res){
  let lecturer = req.session.lecturer
  lect_query.getLecturerByUsername(lecturer, function(err, found){
    res.render('lecturer/profile', {title:"Lecturer's Profile", found})
  })
}

exports.getSettings = function(req, res){
  let lecturer = req.session.lecturer
  lect_query.getLecturerByUsername(lecturer, function(err, found){
    let passToChange = ''
    if(found.newpass !== ""){
      passToChange = funcs.decryptTo(found.newpass)
    } else {
      passToChange = found.oldpass
      console.log('oldpass : ', passToChange)
    }
    res.render('lecturer/settings', {title:"Settings", found, passToChange})
  })
}

exports.postSettings = function(req, res){
  let lecturer = req.session.lecturer
  let newpass  = req.body.newpass
  let renew    = req.body.renewpass
  // check if newpass & renew is the same
  if(renew !== newpass){
    console.log('confirmation password is different. try again')
    res.redirect('#')
  } else {
    // check if new pass is different to oldpass
    lect_query.getLecturerByUsername(lecturer, function(e, found){
      if(found.oldpass == newpass){
        console.log('password is same as the old one. use different one')
        res.redirect('#')
      } else {
        // set newpass to oldpass in database
        console.log('SUCCESS!') 
        newpass = funcs.encryptTo(newpass)
        lect_query.updatePassword(lecturer, newpass, function(err, succeed){
          if(succeed){
            console.log('success changing password')
            res.redirect('#')
          }
        })
      }
    })
  }
}

exports.getTa1 = function(req, res){
  let nim = req.params.nim
  let supervisor = req.session.lecturer
  queries.getStudentByNIM(nim, function(err, std){
    let notifsLength  = std.notifs.length+1,
        milesLength   = std.milestones.length+1,
        category      = 'ta1',
        msg           = 'Your TA 1 has been approved!'
    queries.addNotif(nim, notifsLength, msg, function(err){
      queries.addMilestone(nim, milesLength, category, function(err){    
        queries.setTa1(nim, supervisor, function(err){
          res.redirect(baseurl+'/student/detail/'+nim)
        })
      })
    })
  })
}

exports.getTa2 = function(req, res){
  let nim = req.params.nim
  let supervisor = req.session.lecturer
  queries.getStudentByNIM(nim, function(err, std){
    let notifsLength  = std.notifs.length+1,
        milesLength   = std.milestones.length+1,
        category      = 'ta2',
        msg           = 'Your TA 2 has been approved!'
    queries.addNotif(nim, notifsLength, msg, function(err){
      queries.addMilestone(nim, milesLength, category, function(err){
        queries.setTa2(nim, supervisor, function(err){
          res.redirect(baseurl+'/student/detail/'+nim)
        })
      })
    })
  })
}

exports.getDetailPdf = function(req, res){
  var doc = jsPDF()
  doc.text(20, 20, 'ini test')
  doc.save('Test.pdf', function(err){
    if(!err){
      console.log('save')
      res.redirect('#')
    }
  })
}