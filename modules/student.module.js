var express       = require('express'),
    session       = require('express-session'),
    MongoStore    = require('connect-mongo')(session),
    mongoose      = require('mongoose')
    Student       = require('../models/student.model'),
    app           = express(),
    email         = require('emailjs/email'),
    credentials   = require('../credentials/email')
    var code, completed, hiding
    let user_mail = credentials.user,
        user_pass = credentials.pass
    server        = email.server.connect({
      user: user_mail,
      password: user_pass,
      host: "smtp.gmail.com",
      ssl: true
    })

/* TODO:
  [ ] Function        : Beautify way to fetch data from mongodb
  [ ] Authentication  : user credentials
  [ ] Authorization   : user role, access level
  [ ] StatusCode      : each message in json should include statusCode
*/

var key         = '99u9d9h23h9fas9ah832hr'
var possible    = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
var baseurl_api = 'http://localhost:3500/api/v1/student/'
var baseurl     = 'http://localhost:3500/student'
  var encryptor = require('simple-encryptor')(key),
      caption   = 'Student'

exports.getIndex = function(req,res){
  res.redirect('student/login')
}

exports.getLoginPage = function(req, res){
  console.log("Session : ", req.session.student)
  res.format({
    json: function(){

    },
    html: function(){
      let caption = "Student", code = ''
      res.render('student/login', {title:"Student login", caption:caption, code:code, baseurl:baseurl})
    }
  })
}

exports.getRegisterPage = function(req, res){
  res.render('student/register', {title:"Register yourself", caption:caption, baseurl:baseurl})
}

exports.getHome = function(req, res){
  let nim = req.session.student
  res.render('student/home', {title: "Dashboard ", nim:nim})
}

exports.getProfile = function(req, res){
  let nim = req.session.student
  Student.findOne({nim:nim}, function(err, details){
    try{
      res.render('student/profile', {title: "Profile", nim:nim, details:details})
    } catch(err){
      throw err
    }
  })
}

exports.getSettings = function(req, res){
  hiding      = 'hide'
  let nim = req.session.student
  Student.findOne({nim:nim}, function(err, details){
    try{
      res.render('student/settings', {title: "Settings", nim:nim, hiding:hiding})
    } catch(err){
      throw err
    }
  })
}

exports.getRegisterSuccess = function(req, res){
  res.render('student/register-success', {title:"Register success!", baseurl:baseurl})
}

exports.getForgetPassPage = function(req, res){
  res.render('student/forget-pass', {title:"Forget password", caption:caption, baseurl:baseurl})
}

exports.getPassResetSuccess = function(req, res){
  res.render('student/password_sent', {title:"Password sent", caption:caption, baseurl:baseurl})
}

exports.getResendActivation = function(req, res){
  res.render('student/resend-activation', {title:"Resend activation link", caption:caption, baseurl:baseurl})
}

exports.getResendSuccess = function(req, res){
  res.render('student/activation_sent', {title:"Reactivation link sent", caption:caption, baseurl:baseurl})
}

exports.addStudent = function(req, res){
  var pass1   = req.body.password,
      pass2   = req.body.repassword,
      str     = pass1,
      matches = str.match(/\d+/g),
      nim     = req.body.nim
  function isPhysics(nim){
    if(nim.startsWith('102')){
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
    console.log('Not a physics student', str)
    res.format({
      html: function(){
        code  = 'NIM should started by 102* and length is 8'
        res.render('student/register', {title:"Register yourself", caption:caption, code:code})
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
    res.format({
      html: function(){
        code  = 'Email should be : yourname@students.itb.ac.id or yourname@s.itb.ac.id'
        res.render('student/register', {title:"Register yourself", caption:caption, code:code})
      },
      json: function(){
        res.json({
          status:false,
          message: 'Email not valid'
        })
      }
    })
  }

  // Same password validation
  else if(pass1 !== pass2){
    console.log('password does not match : ' + pass1 + 'type of : ' + typeof(pass1))
    res.format({
      html: function(){
        code  = 'Password does not match!'
        res.render('student/register', {title:"Register yourself", caption:caption, code:code})
      },
      json: function(){
        res.json({
          status:false,
          message: 'password does not match'
        })
      }
    })
  }

  // Security check
  else if (str.length <= 5 || matches == null){
    console.log('not secure! your password : ', str)
    res.format({
      html: function(){
        code  = 'Password not secure! Your password must contains strings and numbers in 5 characters length'
        res.render('student/register', {title:"Register yourself", caption:caption, code:code})
      },
      json: function(){
        res.json({
          status:false,
          message: 'password not secure'
        })
      }
    })
  }
  else {
    var text, str
    function makeid(str){
      text = str
      for(var i=0; i<20; i++){
        text += possible.charAt(Math.floor(Math.random() * possible.length))
      }
      return (text)
    }

    let link  = makeid('398hhces8dh8shd8ah')
    let link2 = makeid('8hasa9hsd8hfdh3294')

    let encrypted = encryptor.encrypt(req.body.password)

    var std                 = new Student()
    std.nim                 = req.body.nim
    std.email               = req.body.email
    std.password            = encrypted
    std.registered          = new Date
    std.last_login          = ""
    std.has_resetpass       = false
    std.is_active           = false
    std.inactive_password   = ""
    std.activation_link     = link
    std.passwordreset_link  = link2
    std.profile.first_name  = ""
    std.profile.last_name   = ""
    std.profile.gender      = ""
    std.profile.address     = ""
    std.profile.birthday    = ""

    Student.findOne({nim: std.nim}, function(err, exist){
      if(exist){
        console.log('NIM exist')
        res.format({
          json: function(){
            res.json({
              "Status":"Error",
              "Message":"NIM exist! Try another one"
            })
          },
          html: function(){
            code  = 'NIM exist!'
            res.render('student/register', {title:"Register yourself", caption:caption, code:code})
          }
        })
      } else {
        std.save(function(err){
          if(err){
            res.send(err)
          }
          else {
            // everything's okay, send activation_link through email
            let activate_link = baseurl+'/account/activation/'+link
            let email         = std.email
            console.log('link to activate : ', activate_link)
            let message = {
              text: "Please click here to activate your account : "+activate_link + "\n \n Admin Fisika ITB",
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
            res.format({
              json: function(){
                res.json({
                  status: true,
                  message: 'Student created'
                })
              },
              html: function(){
                res.redirect('./register/success')
              }
            })
          }
        })
      }
    })
  }
}

exports.activateStudent = function(req, res){
  var link = req.params.link
  Student.findOne({activation_link: link}, function(err, found){
    if(found){
      let nimToUpdate = found.nim
      Student.update({nim: nimToUpdate},{$set: {
        is_active: true
      },
    }, function (err, success){
      if(success){
        let nim_success = nimToUpdate
        console.log('success update')
        res.format({
          json: function(){
            res.json({
              "Status":"OK",
              "Message":"Account activated"
            })
          },
          html: function(){
            res.render('student/activation-success', {title:"Your account is active!", nim_success:nim_success, baseurl:baseurl})
          }
        })
      } else {
        console.log('actiovation failed, reason ', err)
        res.json({
          "Status":"Error",
          "Message":"Activation failed"
        })
      }
    }
  )
    } else {
      console.log('activation_link not found')
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
          code = 'Your account was actived. No need to reactivate.'
          res.render('student/resend-activation', {title:"Resend activation link", caption:caption, baseurl:baseurl, code:code})
        } else {
          console.log('nim and email found ' + nim + ' ' + email)
          let reactivate = found.activation_link
          let link       = baseurl+'/account/activation/'+reactivate
          server.send({
            subject:"[Resend activate_link] - "+nim,
            text:"Please click here to activate your account : "+ link + "\n \n Administrator Thement Fisika ITB",
            to:"<"+email+">",
            from:"[FISIKA ITB] <notification@fi.itb.ac.id>"
          })
          console.log('A reactivate email was sent to ', email)
          res.format({
            json: function(){
              res.json({
                status:true,
                message: 'Resend activated link'
              })
            },
            html: function(){
              res.redirect('./resend_activation/sent')
            }
          })
        }
      } else {
      console.log('NIM / email not found')
      code = 'NIM / email not found'
      res.format({
        json: function(){
          res.json({
            "Status":"Error",
            "Message":"NIM / email not found"
          })
        },
        html: function(){
          res.render('student/resend-activation', {title:"Resend activation link", caption:caption, baseurl:baseurl, code:code})
        }
      })
    }
  })
}

exports.requestPasswordChange = function(req, res){
  let nim   = req.body.nim,
      email = req.body.email,
      code
  Student.findOne({$and : [{nim: nim}, {email: email}]}, function(err, found){
    if(found){
        if(found.is_active == true){
          console.log('user is : ' + found.nim + ' email : ' + found.email)
          let url = baseurl + '/account/resetpassword/' + found.passwordreset_link
          let nimToReset = found.nim

          // TODO: make it to middleware
          var text, str
          function makeid(){
          	text = ''
            for(var i=0; i<10; i++){
            	text += possible.charAt(Math.floor(Math.random() * possible.length))
            }
            return (text)
          }
          let inactive_pass = makeid()
              Student.update({nim: nimToReset}, {$set: {
                inactive_password : inactive_pass
              },
            }, function(err, success){
              if(success){
                let email = found.email
                console.log('inactive_pass : ' + inactive_pass + 'reset link : ' + url)
                server.send({
                  subject:"[Reset Password] - "+nim,
                  text:"Here is your new password : " + inactive_pass + " \n Click here to reset your password : "+url + "\n \n <strong >Administrator Thement Fisika ITB </strong>",
                  to:"<"+email+">",
                  from:"[FISIKA ITB] <notification@fi.itb.ac.id>"
                })
                console.log('An reset password email was sent to', email)
                res.redirect('./forget_pass/sent')
              } else {
                console.log('error creating inactive_password')
              }
            }
          )
        } else {
           console.log('account not activated yet')
           code = 'Student not activated. Please activate your account first'
           res.format({
             json: function(){
               res.json({
                 "Status":"Error",
                 "Message":"Student not activated. Please activate your account first"
               })
             },
             html: function(){
               res.render('student/forget-pass', {title:"Forget password", caption:caption, baseurl:baseurl, code:code})
             }
           })
        }
      } else {
      console.log('NIM / email not found')
      code = 'NIM / email not found'
      res.format({
        json: function(){
          res.json({
            "Status":"Error",
            "Message":"NIM / email not found"
          })
        },
        html: function(){
          res.render('student/forget-pass', {title:"Forget password", caption:caption, baseurl:baseurl, code:code})
        }
      })
    }
  })
}

exports.activatePasswordChange = function(req, res){
  let link = req.params.link
  Student.findOne({passwordreset_link: link}, function(err, found){
    if(found){
      let nimToReset  = found.nim,
          newPass     = found.inactive_password,
          encrypted   = encryptor.encrypt(newPass)
      console.log('new pass : ', newPass)
      Student.update({nim: nimToReset}, {$set: {
        password: encrypted,
        has_resetpass: true
      },
    }, function(err, success){
      if(success){
        console.log('success reset password, new password : ', newPass)
        res.format({
          json: function(){
            res.json({
              "Status":"OK",
              "Message":"Succeed reset password. New password : " + newPass
            })
          },
          html: function(){
            res.render('student/resetpassword', {title: "Password has been reset", caption:caption, baseurl:baseurl, newPass:newPass})
          }
        })
      } else {
        console.log('failed to reset password, reason : ', err)
        res.json({
          "Status":"Error",
          "Message":"Failed to reset password"
        })
      }
    }
  )
    } else {
      console.log('reset password link incorrect')
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
      nim         = req.session.student,
      hiding      = 'hide'

  if(oldPass !== '' && newPass !== ''){
    Student.findOne({nim: nimToChange}, function(e, s){
      if(s){
        let decrypted = encryptor.decrypt(s.password)
        if(oldPass == decrypted){
        // check if retype password same
        if(newPass !== rePass){
          console.log('password not same')
          res.json({
            status:false,
            message:'password not the same'
          })
        } else {
          let encrypted = encryptor.encrypt(newPass)
            Student.update({nim: nimToChange}, {$set: {
              password: encrypted
            },
          },
            function(err, success){
              if(success){
                completed = 'Update password success'
                hiding = ''
                console.log('Password has been changed.')
                res.format({
                  json: function(){
                    res.json({
                      "Status":"OK",
                      "Message":"Password has been changed"
                    })
                  },
                  html: function(){
                    res.render('student/settings', {title: "Settings", nim:nim, completed:completed, hiding:hiding})
                  }
                })
              } else {
                console.log('Failed to change password')
                res.json({
                  "Status":"Error",
                  "Message":"Failed to change password"
                })
              }
            }
          )
        }
      } else {
          console.log('Old password is wrong. Try again')
          res.json({
            "Status":"Error",
            "Message":"Wrong old password"
          })
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
  Student.findOne({nim: nimToUpdate}, function(err, success){
    if(success){
      Student.update({nim: nimToUpdate}, {$set: {
        'profile.first_name': req.body.first_name,
        'profile.last_name': req.body.last_name,
        'profile.gender': req.body.gender,
        'profile.address': req.body.address,
        'profile.birthday': req.body.birthday
      },
    }, function(err, succeed){
      if(succeed){
        console.log('success update profile')
        res.json({
          "Status":"OK",
          "Message":"Profile updated"
        })
      } else {
        console.log('error updating profile', err)
        res.json({
          "Status":"Error",
          "Message":"Error updated profile"
        })
      }
    }
  )
    } else {
      console.log('cannot find student')
      res.json({
        "Status":"Error",
        "Message":"Student not found"
      })
    }
  })
}

exports.router = module;
