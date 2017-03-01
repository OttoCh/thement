"use strict"

var Lect        = require('../../models/lecturer'),
    Student     = require('../../models/student'),
    Std         = require('../../models/student.model'),
    funcs       = require('../../middlewares/funcs'),
    report      = require('../../models/report')

const baseurl   = 'http://localhost:3500/lecturer'
var hiding      = ''

exports.getIndex = function(req, res){
  res.redirect('lecturer/login')
}

exports.getLoginPage = function(req, res){
  res.render('lecturer/login', {title:"Lecturer login page", baseurl})
}

exports.getForgetPassPage = function(req, res){
  res.render('lecturer/forget-pass', {title:"Forget password", baseurl})
}

exports.getHome = function(req, res){
  let lecturer  = req.session.lecturer
  Lect.findOne({username:lecturer}, function(e, found){
    if(found){
      let msgAlert = ''
      // check if oldpass has not been changed
      if(found.oldpass == found.username+'123'){
        console.log('oldpass must be changed')
        msgAlert = 'red'
      } else {
        console.log('oldpass is OKAY')
        msgAlert = ''
      }
      res.render('lecturer/home', {title: "Home", baseurl, found, hiding, msgAlert})
    } else {
      console.log('no lecturer found')
    }
  })
}

exports.getCandidates = function(req, res){
  let lecturer = req.session.lecturer
  Lect.findOne({username:lecturer}, function(e, f){
    if(f){
      let cans    = []
      let calons  = f.candidates
      for(var i=0; i<calons.length; i++){
        cans.push({
          index:i,
          nim:calons[i]
        });
      }
      res.render('lecturer/candidates', {title:"All candidates", baseurl, cans, f})
    } else {
      console.log('lecturer not found')
    }
  })
}

exports.getDetailCandidate = function(req, res){
  Std.get(req.params.nim, function(err, student){
    res.render('lecturer/candidate-detail', {title:"Candidate detail", baseurl, student})
  })
}

exports.rejectCandidate = function(req, res){
  let lecturer = req.session.lecturer
  let nimToRemove = req.params.nim
  Lect.update({username:lecturer}, {$pull : {
        candidates: nimToRemove
      },
    }, function(e, s){
      if(s){
        console.log('success remove student')
        nimToRemove = Number(nimToRemove)
        Student.findOne({nim: nimToRemove}, function(e, found){
          let n = found.notifs.length
          Student.update({nim:nimToRemove}, {$set: {
            supervisor: "",
            is_choose: false,
            is_accepted: false,
            notif_seen: false
              },
              $push : {
                notifs: {
                  "id":n+1,
                  "date": new Date(),
                  "notif": "You are rejected by : " + lecturer,
                  "has_seen": false
                }
              },
            }, function(e, r){
              console.log('success rejecting student')
              res.redirect(baseurl+'/candidates')
            }
          )
        })
      } else {
        console.log('error when removing nim from candidates')
      }
    }
  )
}

exports.acceptCandidate = function(req, res){
  let lecturer    = req.session.lecturer
  let nimToAccept = req.params.nim
  // add nim to 'students' field
  Lect.update({username:lecturer}, {$push : {
        students: nimToAccept
      },
    }, function(err){
      if(!err){
        // remove nim from 'candidates' field
        Lect.update({username:lecturer}, {$pull: {
          candidates: nimToAccept
        },
      }, function(err){
        if(!err){
          // change status is_accepted to true
          nimToAccept = Number(nimToAccept)
          Student.update({nim:nimToAccept}, {$set : {
            is_accepted: true,
            notif_seen:false
          },
        }, function(err){
          if(!err){
            Student.findOne({nim:nimToAccept}, function(e, f){
              let n = f.notifs.length
              Student.findOne({nim:nimToAccept}, function(e, f){
                let n = f.notifs.length
                console.log('current notifs : ', n)
                Student.update({nim:nimToAccept}, {$push : {
                  notifs: {
                    "id":n+1,
                    "date": new Date(),
                    "notif": "You are ACCEPTED by : " + lecturer,
                    "has_seen": false
                  }
                },
              }, function(e, s){
                    let supervisor = f.supervisor
                    //console.log('NIM : ' + nim + ' and Supervisor is ' + supervisor)
                    var rep         = new report()
                    rep.nim         = nimToAccept
                    rep.supervisor  = supervisor
                    rep.is_create   = false
                    rep.is_approved = false
                    rep.save(function(err){
                      if(!err){
                        console.log('is_accepted is true')
                        res.redirect(baseurl+'/candidates')
                      }
                    })
                  }
                )
              })
            })
                  }
                }
              )
            }
          }
        )
      }
    }
  )
}

exports.getFixStudents = function(req, res){
  let lecturer = req.session.lecturer
  Lect.findOne({username:lecturer}, function(err, f){
    if(f){
      let stds = []
      let std  = f.students
      for(var i=0; i<std.length; i++){
        stds.push({
          index:i,
          nim:std[i]
        });
      }
      res.render('lecturer/students', {title:"Fix students", baseurl, stds, f})
    }
  })
}

exports.postLogin = function(req, res){

  let user  = req.body.username
  let pass  = req.body.password
  Lect.findOne({username:user}, function(e, found){
    if(found){
      console.log('username : ', user)
      if (found.newpass == ""){
        // check newpass
        console.log('newpass exist')
        let decrypted = funcs.decryptTo(found.newpass)
        if(pass !== decrypted){
          console.log('wrong new pass')
          res.send('try again')
        } else {
          console.log('logged in')
          res.send('loggedin')
        }
      } else {
        // check oldpass, redirect to change pass
        console.log('still oldpass')
        if(pass == found.oldpass){
          // logged in, redirect to change pass
          console.log('logged in, change password immediately')

          // save session
          req.session.lecturer = user
          console.log('Logged in as', req.session.lecturer)
          res.redirect('home')
        } else {
          console.log('wrong password')
          res.json({
            status: false,
            message: 'wrong password'
          })
        }
      }
    } else {
      console.log('NOT FOUND')
      res.json({
        status: false,
        message: 'username not found'
      })
    }
  })
}

exports.postLogout = function(req, res){
  req.session.destroy(function(err){
    if(err){
        console.log(err);
    } else {
        res.format({
          json: function(){
            res.send({
              status:true,
              message: "Logged out"
            })
          },
          html: function(){
            res.redirect('./login')
          }
        })
    }
  });
}

exports.changeInitPass = function(req, res){
  // get username from session
  let user     = req.body.username,
      oldpass  = req.body.oldpass,
      newp     = req.body.newpass,
   enc_newpass = funcs.encryptTo(newp),
   resetlink   = funcs.maxRandom('as82h323h')

  // check if oldpass true
  Lect.update({username: user}, {$set: {
        newpass: enc_newpass,
        passwordreset_link: resetlink
      },
    }, function(e, success){
      if(success){
        console.log('success')
        res.json({
          status: true,
          message: 'change initial pass success'
        })
      } else {
        console.log('error')
      }
    }
  )
}

exports.getDetailStudent = function(req, res){
  let param = req.params.nim
  Student.findOne({nim:param}, function(e, std){
    let profile   = std, last_seen
    // check if student ever login
    if(std.last_login != null){
      last_seen = funcs.friendlyDate(std.last_login)
    } else {
      last_seen = 'Never'
    }
    report.findOne({nim:param}, function(e, report){
      let showAccept = 'hide'
      let objReports = []
      let reps = report.reports
      let approval = report.is_approved
      if(approval == true){
        showAccept = 'hide'
      } else {
        showAccept = ''
      }

      if(reps.length > 0){
        console.log('there is ONE OR MORE report', reps.length)
      } else {
        console.log('NO REPORT', reps.length)
      }

      for(var i=0; i<reps.length; i++){
        objReports.push({
          index: reps[i].id,
          title: reps[i].title,
          body: reps[i].body,
          last_edit: funcs.friendlyDate(reps[i].last_edit),
          file_location: reps[i].file_location,
          file_name: reps[i].file_name
        })
      }
      res.render('lecturer/student-detail', {title:"Student detail", baseurl, last_seen, profile,
        objReports:objReports, showAccept:showAccept
      })
    })
  })
}

exports.acceptStudentReport = function(req, res){
  let lecturer = req.session.lecturer
  let url   = req.url
  let nims  = url.split('/')
  let nim   = Number(nims[3])
  console.log('accept report for ' + nim + ' type : ' + typeof(nim))
  report.update({nim:nim},{$set: {
      is_approved: true,
      is_create: false
    },
  }, function(e, accepted){
      // find reportID
      report.findOne({nim:nim}, function(e,r){
        let reportID = r.reports.length
        
        Student.findOne({nim:nim}, function(err, std){
          // set notif tp unseen  
          Student.update({nim:nim}, {$set: {
            notif_seen: false
            },}, function(e, seen){
            // add notif to student
            let n = std.notifs.length
            Student.update({nim:nim},
                {$push: {
                  notifs: {
                    "id":n+1,
                    "date": new Date(),
                    "notif": "Your report #"+ reportID +" had approved by : " + lecturer,
                    "has_seen": false
                  }
                },
              }, function(e, report){
                res.redirect(baseurl+'/students')
              }
            )
          })
        })
      })
    }
  )
}

exports.getProfile = function(req, res){
  let lecturer = req.session.lecturer
  Lect.findOne({username:lecturer}, function(err, found){
    res.render('lecturer/profile', {title:"Lecturer's Profile", found})
  })
}

exports.getSettings = function(req, res){
  res.send('lecturer settings')
}
