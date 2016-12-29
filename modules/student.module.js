var express       = require('express'),
    session       = require('express-session'),
    MongoStore    = require('connect-mongo')(session),
    mongoose      = require('mongoose')
    Student       = require('../models/student.model'),
    app           = express()

/* TODO:
  [ ] Function        : Beautify way to fetch data from mongodb
  [ ] Authentication  : user credentials
  [ ] Authorization   : user role, access level
  [ ] StatusCode      : each message in json should include statusCode
*/

var key       = '99u9d9h23h9fas9ah832hr'
var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
var baseurl   = 'http://localhost:3500/api/v1/student/'
var encryptor = require('simple-encryptor')(key)

exports.getIndex = function(req, res){
  console.log("Session : ", req.session.student)
  res.json({
    "Status":"OK",
    "Message":"api/v1/student",
    "Session": req.session.student
  })
}

exports.addStudent = function(req, res){

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

  // TODO : NIM should be started by 102*

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
      res.json({
        "Status":"Error",
        "Message":"NIM exist! Try another one"
      })
    } else {
      std.save(function(err){
        if(err){
          res.send(err)
        }
        else {
          res.json({
            "Status":"OK",
            "Message":"Student created"
          })
        }
      })
    }
  })
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
        console.log('success update')
        res.json({
          "Status":"OK",
          "Message":"Account activated"
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

exports.requestConfirmation = function(req, res){
  let nim   = req.body.nim,
      email = req.body.email
  if(nim !== '' && email !== ''){
    Student.findOne({$and : [{nim: nim}, {email: email}]}, function(err, found){
        if(found){
          console.log('sending confirmation email')
          // TODO: sending activation_link via email
          res.json({
            "Status":"OK",
            "Message":"A confirmation link will be sent via email"
          })
        } else {
          console.log('NIM / Email not found')
          res.json({
            "Status":"Error",
            "Message":"NIM / email not found"
          })
        }
      }
    )
  } else {
    console.log('nim and email should not left empty')
    res.json({
      "Status":"Error",
      "Message":"NIM and Email should not left empty"
    })
  }
}

exports.requestPasswordChange = function(req, res){
  let nim   = req.body.nim,
      email = req.body.email
  Student.findOne({$and : [{nim: nim}, {email: email}]}, function(err, found){
    if(found){
        if(found.is_active == true){
          console.log('user is : ' + found.nim + ' email : ' + found.email)
          let url = baseurl + 'resetpassword/' + found.passwordreset_link
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
                console.log('inactive_pass : ', inactive_pass)
                // TODO: send via email
                res.json({
                  "Status":"OK",
                  "Message":"NIM & email match. Reset link : " + url,
                  "Inactive Password": inactive_pass
                })
              } else {
                console.log('error creating inactive_password')
              }
            }
          )
        } else {
           console.log('account not activated yet')
           res.json({
             "Status":"Error",
             "Message":"Student not activated. Please activate your account first"
           })
        }
      } else {
      console.log('NIM / email not found')
      res.json({
        "Status":"Error",
        "Message":"NIM / email not found"
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
        console.log('success reset password, new password : ', encrypted)
        res.json({
          "Status":"OK",
          "Message":"Succeed reset password. New password : " + encrypted
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
      newPass     = req.body.new_pass
  if(oldPass !== '' && newPass !== ''){
    Student.findOne({nim: nimToChange}, function(e, s){
      if(s){
        let decrypted = encryptor.decrypt(s.password)
        if(oldPass == decrypted){
        let encrypted = encryptor.encrypt(newPass)
          Student.update({nim: nimToChange}, {$set: {
            password: encrypted
          },
        },
          function(err, success){
            if(success){
              console.log('Password has been changed.')
              res.json({
                "Status":"OK",
                "Message":"Password has been changed"
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
