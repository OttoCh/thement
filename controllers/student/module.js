"use strict"

// load packages
var express       = require('express'),
    Student       = require('../../models/student'),
    report        = require('../../models/report'),
    Lect          = require('../../models/lecturer'),
    Msg           = require('../../models/message'),
    Adm           = require('../../models/admin'),
    multer        = require('multer'),
    email         = require('emailjs/email'),
    progress      = require('progress-stream'),
    p             = progress(),
    app           = express()

// load credentials
const credentials   = require('../../credentials/email'),
    user_mail     = credentials.user,
    user_pass     = credentials.pass,

// load middlewares
    funcs         = require('../../middlewares/funcs'),
    queries       = require('../../models/query.student')

// constants
const caption       = 'Student'
const baseurl_api   = 'http://localhost:3500/api/v1/student/'
const statik        = 'http://localhost:3500/static'

const FOOTER_EMAIL  = 'Admin Thement ITB \n  ---------------------- \n  Copyright (c) 2017 | All rights reserved'
var baseurl         = require('../../config/baseurl'),
    root_url        = baseurl.root,
    baseurl         = baseurl.root + 'student'

// statusCode
var code
var hiding            = 'hide'
var registerCode      = ''
var forgetCode        = ''
var profileCode       = ''
var settingsCode      = ''
var settingsWrongCode = ''

/* TODO:
  [ ] StatusCode : each message in json should include statusCode

*/

// emailjs config
var server = email.server.connect({
  user: user_mail,
  password: user_pass,
  host: "smtp.gmail.com",
  ssl: true
})

// multer config
var storage = multer.diskStorage({
  destination: function(req, file, cb){
    cb(null, 'public/images/profiles')
  },
  filename: function(req, file, cb, res){
    let student   = req.session.student;
    let imgName   = funcs.minRandom()+'.png'
    Student.update({nim:student}, {$set: {
      'profile.img_url': root_url+'/static/images/profiles/'+imgName
    },
  }, function(err, result){
      if(result){
        console.log('success')
        cb(null, imgName)
      } else {
        console.log('nothing found')
      }
    })
  }
})

var upload  = multer({storage:storage}).single('image')

/* STATIC ROUTE HANDLER */
exports.getIndex = function(req,res){
  res.redirect('student/login')
}

exports.getRegisterSuccess = function(req, res){
  res.render('student/register-success', {title:"Register success!", baseurl})
}

exports.getForgetPassPage = function(req, res){
  res.render('student/forget-pass', {title:"Forget password", caption, baseurl, forgetCode, hiding})
}

exports.getPassResetSuccess = function(req, res){
  res.render('student/password_sent', {title:"Password sent", caption, baseurl})
}

exports.getResendActivation = function(req, res){
  res.render('student/resend-activation', {title:"Resend activation link", caption, baseurl, code, hiding})
}

exports.getResendSuccess = function(req, res){
  res.render('student/activation_sent', {title:"Reactivation link sent", caption, baseurl})
}

exports.getImageUploaded = function(req, res){
  res.render('student/profile_sent', {title:"Image profile updated"})
}

exports.getRegisterPage = function(req, res){
  res.render('student/register', {title:"Register yourself", caption, baseurl, registerCode, hiding})
}
/* STATIC ROUTE HANDLER */

/* DYNAMIC ROUTES */
exports.getLoginPage = function(req, res){
  if(req.session.student){
    res.redirect('./home')
  } else {
    let caption = "Student", code = ''
    res.render('student/login', {title:"Student login", caption, code, baseurl, hiding})
  }
}

exports.getHome = function(req, res){
  let colored, hideChoosing = '', reportCreate = 'hide', reportAll = 'hide', nReport = 'none', msgReport = 'hide', reportStatus = 'hide'
  let nim = req.session.student
  let nimId = req.session.student
  let newBC
  let showBC    = 'hide'
  let showHint  = 'hide'
  let showAnn   = 'hide'

  queries.getStudentByNIM(nim, function(err, student){      
    let last_login = funcs.friendlyDate(student.last_login)
    let registered_at = funcs.friendlyDate(student.registered)
    if(last_login == registered_at){
      showHint = ''
    } else {
      showHint = 'hide'
    }

    // study level
    let studyLevel
    let nimLevel  = student.nim.toString()
    String.prototype.startsWith = function(str){
      return (this.indexOf(str) === 0)
    }
    switch(true){
      case nimLevel.startsWith('102') : studyLevel = 'undegraduate'
      break;

      case nimLevel.startsWith('202') : studyLevel = 'master'
      break;

      case nimLevel.startsWith('202') : studyLevel = 'master'
      break;

      default: studyLevel ='undetected'
      break;
    }
    studyLevel = studyLevel.toUpperCase()
    
    let state, stateColor, dosen, divReport = 'hide', acceptance
    var supervisor = student.supervisor
    var superv_username = student.supervisor
    if(supervisor == ""){
      supervisor = 'None'
    }

    if(student.is_choose == false){
      state = 'NONE', stateColor = 'red', acceptance = 'badge badge-important'
    } else if(student.is_accepted == false && supervisor != "" ){
      state = 'PENDING', stateColor = 'orange', hideChoosing = 'hide', acceptance = 'badge badge-warning'
    } else if(student.is_accepted == true){
      state = 'ACCEPTED', stateColor = 'green', hideChoosing = 'hide', reportCreate = '', divReport = '', acceptance = 'badge badge-success'
    }

      // convert username to fullname supervisor
      Lect.findOne({username:supervisor}, function(err, superv){
        if(superv){
          supervisor = superv.name
        }
        else {
          supervisor = '🡳'
        }

      // NOTIF CHECKING
      let notifs        = student.notifs
      let n             = notifs.length
      
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
      notifs = objNotifs
      
      let newNotif      = notifs.length
      let isNotifShow   = ''
      
      if (student.notif_seen == true){
        isNotifShow = 'hide'
      } else {
        isNotifShow = '', newNotif = 'NEW'
      }

      // limit to 3
      if(n > 0){
        notifs = notifs
      }
      else {
        console.log('no notifs yet')
      }
      if (student.notif_seen == false) {
        colored = '#b3d9ff'
      } else {
        colored = ''
      }

      // get milestones
      let miles       = student.milestones
      let milesLength = miles.length
      let mls         = []
      let milesStrip  = ''
      let milesPercen
      for(var k=0; k<miles.length; k++){
        mls.push({
          id:miles[k].id,
          category:miles[k].category,
          date:miles[k].date
        })
      }
      let latestMiles = mls[milesLength-1].category
      switch(latestMiles){
        case 'registered' : latestMiles = 'registered', milesStrip = 'danger', milesPercen = 20
          break;
        case 'accepted'   : latestMiles = 'accepted', milesStrip = 'warning', milesPercen = 40
          break;
        case 'report'     : latestMiles = 'progress report', milesStrip = 'success', milesPercen = 60
          break;
        case 'ta1'        : latestMiles = 'LULUS TA 1', milesStrip = 'info', milesPercen = 80
          break;
        case 'ta2'        : latestMiles = 'LULUS TA 2', milesStrip = 'info', milesPercen = 100
          break;
      }

      // MESSAGE CHECKING
      let allMsgs
      Msg.findOne({nim:nim}, function(e, msg){
        if(msg){
          allMsgs = msg.messages
          // get latest 3 notifs
          
          allMsgs.sort(function(a,b){
            return parseInt(b.id) - parseInt(a.id)
          })
          let n   = allMsgs.length
          // convert array of objects to readable format
          var objMsgs = []
          if(n > 0){
            if(n < 3){
              // show all
              for(var i=0; i<n; i++){
                objMsgs.push({
                  index:allMsgs[i].id,
                  author:allMsgs[i].author,
                  body:allMsgs[i].body,
                  date_created:funcs.friendlyDate(allMsgs[i].date_created)
                })
              }
            } else {
              // show only 3
              for(var i=0; i<3; i++){
                objMsgs.push({
                  index:allMsgs[i].id,
                  author:allMsgs[i].author,
                  body:allMsgs[i].body,
                  date_created:funcs.friendlyDate(allMsgs[i].date_created)
                })
              }
            }
          } else {
            objMsgs = ''
          }
        } else {
          // student has not created message yet
          
          allMsgs = 'no message yet'
          msg = []
          objMsgs = []
        }
      
      // SHOW or HIDE 'NEW' message
      let msgShow = 'hide', msgNotif, coloredMsg
      if(msg.has_seen_std == true){
        msgShow = 'hide', msgNotif = '', coloredMsg = ''
      } else if(msg.has_seen_std == false) {
        msgShow = '', msgNotif = 'NEW', coloredMsg = '#F6E18E'
      } else {
        msgShow = 'hide', msgNotif = '', coloredMsg = ''
      }

      // ANNOUNCEMENT CHECKING
      let stdMsg  = []
      Adm.aggregate({$match:{"role":"operator"}},{$unwind:"$announcements"},{$match:{$or:[{"announcements.to":"students"}, {"announcements.to":"all"}]}},
        function(err, anns){
          if(anns.length > 0){
          for(var m=0; m<anns.length; m++){
            stdMsg.push({
              id:anns[m].announcements.id,
              body:anns[m].announcements.body,
              seen_by:anns[m].announcements.seen_by
            })
          }
          
          let latestMsg = stdMsg[anns.length-1]
          let has_seen  = latestMsg.seen_by 
          
          // check if latest message has read by nim
          if(has_seen.includes(nimId) == true){
            console.log('hide announcement')
            showAnn = 'hide'
          } else {
            showAnn = ''
            console.log('SHOW ANNOUNCEMENT')
            // show announcement
          }
      } else {
        
      }

      // REPORT CHECKING
      report.findOne({nim:nim}, function(err, rep){
        var coloredStatus = '', statusStyle = ''
        if(rep){
          if(rep){
            // check if user had created a report
            if(rep.reports.length > 0){
              let status = rep.is_approved
              coloredStatus = status.toString()
              coloredStatus = coloredStatus.toUpperCase()
              if(status == true){
                coloredStatus = 'DISETUJUI'
                statusStyle = 'green'
              } else {
                coloredStatus = 'BELUM DISETUJUI'
                statusStyle = 'red'
              }
              nReport = rep.reports.length
              reportCreate = 'hide',
              msgReport = '',
              reportStatus = ''
            } else {
              console.log('user has report initial, but not created yet')
            }
          } else {
            
          }

           // check for any new broadcast message
            Msg.findOne({lecturer:superv_username}, function(err, bc){
                if(bc){
                  var bcs       = bc.messages
                  var bcLength  = bcs.length
                  var nimStr    = student.nim.toString()
                  newBC     = 'BROADCAST'
                                  
                  // check if the latest message contain nimStr
                  if(bc.messages.length > 0){
                    if(bcs[bcLength-1].has_seen_by.includes(nimStr) == true){
                      } else {
                        coloredMsg = '#4FBFE1'
                        showBC = ''
                      }
                  } else {
                    console.log('no bc message yet')
                  }
                } else {
                  bcs = ''
                }
                 
              res.render('student/home', {title: "Dashboard ", nim, student, last_login, state, stateColor, supervisor,
                notifs, colored, hideChoosing, reportCreate, nReport, msgReport, reportStatus,
                coloredStatus, statusStyle, divReport, newNotif, registered_at,
                acceptance, isNotifShow, allMsgs, objMsgs, msgShow, msgNotif, coloredMsg, latestMiles, milesStrip, milesPercen,
                newBC, showBC, showHint, showAnn, studyLevel, baseurl, root_url
              })
            })
        } else {
          
          res.render('student/home', {title: "Dashboard ", nim, student, last_login, state, stateColor, supervisor,
            notifs, colored, hideChoosing, reportCreate, nReport, msgReport, reportStatus,
            coloredStatus, statusStyle, divReport, newNotif, registered_at,
            acceptance, isNotifShow, allMsgs, objMsgs, msgShow, msgNotif, coloredMsg, latestMiles, milesStrip, milesPercen, newBC,
            showBC, showHint, showAnn, studyLevel, baseurl, root_url
              })
            }
          })
        })
      })
    })
  })
}

exports.getProfile = function(req, res){
  let nim = req.session.student
  queries.getStudentByNIM(nim, function(err, found){
    try{
      res.render('student/profile', {title: "Profile", nim, found})
    } catch(err){
      throw err
    }
  })
}

exports.getSettings = function(req, res){
  let nim = req.session.student
  queries.getStudentByNIM(nim, function(err, success){
    let oldpass = funcs.decryptTo(success.password)
    try{
      res.render('student/settings', {title: "Settings", nim, code, oldpass})
    } catch(err){
      throw err
    }
  })
}

exports.addStudent = function(req, res){
  var pass1   = req.body.password,
      pass2   = req.body.repassword,
      nick    = req.body.nickname,
      full    = req.body.fullname,
      str     = pass1,
      matches = str.match(/\d+/g),
      nim     = req.body.nim
  function isPhysics(nim){
    if((nim.startsWith('102')) || (nim.startsWith('202')) || (nim.startsWith('302'))){
      return true;
    } else {
      return false;
    }
  }
  let email = req.body.email,
         s1 = email.indexOf('@students.itb.ac.id'),
         s2 = email.indexOf('@s.itb.ac.id')

  // NIM validation
  if(!isPhysics(nim) || nim.length !== 8){
    
    res.format({
      html: function(){
        hiding = ''
        registerCode  = 'NIM should started by 102* or 202* or 302* and length is 8'
        res.render('student/register', {title:"Register yourself", caption, registerCode, hiding})
      },
      json: function(){
        res.json({
          status:false,
          message: 'NIM not valid'
        })
      }
    })
  }

  // Email validation
  else if(s1 < 0 && s2 < 0){
    console.log('Invalid email', email)
    hiding = ''
    registerCode  = 'Email should be : yourname@students.itb.ac.id or yourname@s.itb.ac.id'
    res.render('student/register', {title:"Register yourself", caption, registerCode, hiding})
  }

  // Same password validation
  else if(pass1 !== pass2){
    hiding = ''
    registerCode  = 'Password does not match!'
    res.render('student/register', {title:"Register yourself", caption, registerCode, hiding})
  }

  // Security check
  else if (str.length <= 5 || matches == null){
    hiding = ''
    registerCode  = 'Password not secure! Your password must contains strings and numbers in 5 characters length'
    res.render('student/register', {title:"Register yourself", caption, registerCode, hiding})
  }
  else {
    let std                 = new Student()
    std.nim                 = req.body.nim
    std.email               = req.body.email
    std.password            = funcs.encryptTo(req.body.password)
    std.registered          = new Date
    std.last_login          = new Date
    std.ipk                 = 0
    std.ta1                 = ""
    std.ta2                 = ""
    std.report_status       = false
    std.has_resetpass       = false
    std.is_active           = false
    std.is_choose           = false
    std.is_accepted         = false
    std.supervisor          = ""
    std.inactive_password   = ""
    std.notif_seen          = true
    std.activation_link     = funcs.maxRandom('398hhces8dh8shd8ah')
    std.passwordreset_link  = funcs.maxRandom('8hasa9hsd8hfdh3294')
    std.profile.fullname    = full
    std.profile.nickname    = nick
    std.profile.gender      = ""
    std.profile.address     = ""
    std.profile.birthday    = ""
    std.profile.img_url     = ""
    std.profile.img_path    = ""

    Student.findOne({nim: std.nim}, function(err, exist){
      if(exist){
        hiding = ''
        registerCode  = 'NIM exist!'
        res.render('student/register', {title:"Register yourself", caption, registerCode, hiding})
      } else {
        std.save(function(err){
          if(err){
            res.send(err)
          }
          else {
            // everything's okay, send activation_link through email
            let link          = std.activation_link
            let activate_link = baseurl+'/account/activation/'+link
            let email         = std.email
            console.log('activation_link : ', activate_link)
            let message = {
              text: "Please click here to activate your account : "+activate_link + "\n \n " + FOOTER_EMAIL,
              from: "[FISIKA ITB] <notification@fi.itb.ac.id>",
              to: "<"+email+">",
              subject: "[Welcome to thement] - "+nim,
              attachment: [
                {data: "<html> <strong> Fisika ITB </strong> </html>"}
              ]
            }
            server.send(message, function(err, message){
              console.log(err || message)
            })
            res.redirect('./register/success')
          }
        })
      }
    })
  }
}

exports.activateStudent = function(req, res){
  let link = req.params.link
  queries.getStudentByLink(link, function(err, found){
    if(found){
      // check if already activate
      if(found.is_active == true){
        res.send('account already activate. click here to login')
      } else {
        let nimToUpdate = found.nim
        Student.update({nim: nimToUpdate},{$set: {
          is_active: true,
          notif_seen: false
        }, $push: {
          notifs: {
            "id":1,
            "date": new Date(),
            "notif": "Your account is now ACTIVE!",
            "has_seen": false
          },
          milestones:{
            "id":1,
            "date":new Date(),
            "category":"registered"
          }
        },
      }, function (err, success){
        if(success){
          let nim_success = nimToUpdate
          let link_profile = "http://localhost:3500/student/profile"
          Student.update({nim:nimToUpdate}, {$set: {
            notif_seen:false
          },
          $push: {
            notifs: {
              "id":2,
              "date": new Date(),
              "notif": "Please update your profile. Click here " + link_profile ,
              "has_seen": false
            }
          },
        }, function(e, p){
          res.render('student/activation-success', {title:"Your account is active!", nim_success, baseurl})
        }
      )
        } else {
          res.json({
            "Status":"Error",
            "Message":"Activation failed"
          })
        }
      }
    )
      }
    } else {
      res.send({
        "Status":"Error",
        "Message":"activation_link not found"
      })
    }
  })
}

exports.resendConfirmation = function(req, res){
  let nim   = req.body.nim,
      email = req.body.email
  Student.findOne({$and : [{nim: nim}, {email: email}]}, function(err, found){
    if(found){
        if(found.is_active == true){
          hiding = ''
          code = 'Your account was actived. No need to reactivate.'
          res.render('student/resend-activation', {title:"Resend activation link", caption, baseurl, code, hiding})
        } else {
          let reactivate = found.activation_link
          let link       = baseurl+'/account/activation/'+reactivate
          server.send({
            subject:"[Resend activate_link] - "+nim,
            text:"Please click here to activate your account : "+ link + "\n \n " + FOOTER_EMAIL,
            to:"<"+email+">",
            from:"[FISIKA ITB] <notification@fi.itb.ac.id>"
          })
          res.redirect('./resend_activation/sent')
        }
      } else {
      code = 'NIM / email not found'
      res.render('student/resend-activation', {title:"Resend activation link", caption, baseurl, code})
    }
  })
}

exports.requestPasswordChange = function(req, res){
  let nim   = req.body.nim,
      email = req.body.email
  Student.findOne({$and : [{nim: nim}, {email: email}]}, function(err, found){
    if(found){
        if(found.is_active == true){
          let url = baseurl + '/account/resetpassword/' + found.passwordreset_link
          let nimToReset = found.nim

          let inactive_pass = funcs.minRandom()
              Student.update({nim: nimToReset}, {$set: {
                inactive_password : inactive_pass
              },
            }, function(err, success){
              if(success){
                let email = found.email
                server.send({
                  subject:"[Reset Password] - "+nim,
                  text:"Here is your new password : " + inactive_pass + " \n Click here to reset your password : "+url + "\n \n " + FOOTER_EMAIL,
                  to:"<"+email+">",
                  from:"[FISIKA ITB] <notification@fi.itb.ac.id>"
                })
                
                res.redirect('./forget_pass/sent')
              } else {
                console.log('error creating inactive_password')
              }
            }
          )
        } else {
           forgetCode = 'Student not activated. Please activate your account first'
           res.render('student/forget-pass', {title:"Forget password", caption, baseurl, forgetCode})
        }
      } else {
      forgetCode = 'NIM / email not found'
      res.render('student/forget-pass', {title:"Forget password", caption, baseurl, forgetCode})
    }
  })
}

exports.activateResetPass = function(req, res){
  let link = req.params.link
  // not tested, yet
  queries.getStudentByPassLink(link, function(err, found){
    if(found){
      let nimToReset  = found.nim,
          newPass     = found.inactive_password,
          encrypted   = funcs.encryptTo(newPass)
      Student.update({nim: nimToReset}, {$set: {
        password: encrypted,
        has_resetpass: true
      },
    }, function(err, success){
      if(success){
        res.render('student/resetpassword', {title: "Password has been reset", caption, baseurl, newPass})
      } else {
        res.json({
          "Status":"Error",
          "Message":"Failed to reset password"
        })
      }
    }
  )
    } else {
      res.json({
        "Status":"Error",
        "Message":"Reset password link incorrect"
      })
    }
  })
}

exports.changePassword = function(req, res){
  let nimToChange = req.session.student,
      oldPass     = req.body.old_pass,
      newPass     = req.body.new_pass,
      rePass      = req.body.re_newpass,
      nim         = req.session.student

  if(oldPass !== '' && newPass !== ''){
    queries.getStudentByNIM(nim, function(e,s){
      if(s){
        let decrypted = funcs.decryptTo(s.password)
        if(oldPass == decrypted){
        // check if retype password same
        if(newPass !== rePass){
          req.flash('error', 'Confirmation password does not match!')
          res.redirect('./settings')
        } else {
          let encrypted = funcs.encryptTo(newPass)
            Student.update({nim: nimToChange}, {$set: {
              password: encrypted
            },
          },
            function(err, success){
              if(success){
                req.flash('success', 'Password updated')
              } else {
                req.flash('error', 'Failed to change password')
              }
              res.redirect('./settings')
            }
          )
        }
      } else {
          settingsWrongCode = 'Old password is wrong'
          hiding = ''
          res.send('Old password is wrong.')
        }
      } else {
        console.log('NIM not found')
        res.json({
          "Status":"Error",
          "Message":"NIM not found"
        })
      }
    })
  } else {
    console.log('empty')
    res.json({
      "Status":"Error",
      "Message":"Body should not left empty"
    })
  }
}

exports.updateProfile = function(req, res){
  let nimToUpdate = req.session.student
  let nim = req.session.student
  queries.getStudentByNIM(nimToUpdate, function(err, found){
    if(found){
      Student.update({nim: nimToUpdate}, {$set: {
        'profile.fullname': req.body.fullname,
        'profile.nickname': req.body.nickname,
        'profile.gender': req.body.gender,
        'profile.address': req.body.address,
        'profile.birthday': req.body.birthday,
        ipk:req.body.ipk
      },
    }, function(err, found){
      if(found){
        // show success message
        req.flash('success', 'Profile updated')
      } else {
        // show error message
        req.flash('error', 'Failed to update profile')
        res.json({
          "Status":"Error",
          "Message":"Error updated profile"
        })
      }
      res.redirect(baseurl+'/profile')
    }
  )
    } else {
      res.json({
        "Status":"Error",
        "Message":"Student not found"
      })
    }
  })
}

exports.imgUpload = function(req, res, next){
  upload(req, res, function(err){
    if(err){
      console.log('error when uploading')
      return
    } else {
      if(req.file == null){
        res.json({
          status: false,
          message: "Please provide a file"
        })
      } else {
        let fileType = req.file.originalname.split('.'),
            type     = fileType[1]
        if(type == 'jpg' || type == 'jpeg' || type == 'png'){
          console.log(p)
          req.flash('success', 'Profile photo updated')
          res.status(204).end()
        } else {
          res.json({
            status: false,
            message:"File must jpeg/jpg/png"
          })
        }
      }
    }
  })
}

exports.getProfileSuccess = function(req, res){
  res.render('student/profile_sent', {title:"Profile photo updated!", baseurl})
}
/* DYNAMIC ROUTES */