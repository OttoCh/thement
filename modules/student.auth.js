var key           = '99u9d9h23h9fas9ah832hr'
var encryptor     = require('simple-encryptor')(key)
var Student       = require('../models/student.model')

exports.stdLogin = function(req, res){
  // TODO: Login with token, generate random strings and numbers
  /*
    Example: PAYLOAD VALUES
    1. User identification  : ID, Display name, avatar, NIM
    2. Token metadata       : IssuedAt, expires, session ID
  */

  let nim   = req.body.nim,
      pass  = req.body.password
  Student.findOne({nim: nim}, function(err, found){
    if(found){
      if (found.is_active == true){
        console.log('check for decrypting')
        let decrypted = encryptor.decrypt(found.password)
        if(pass == decrypted){
          let nim = found.nim
          req.session.student = nim
          Student.update({nim: nim}, {$set: {
            last_login: new Date
          },
        }, function(err, success){
          if(success){
            console.log('Logged in as ', req.session.student)
            res.format({
              json: function(){
                res.json({
                  "Status":"OK",
                  "Message":"Logged in as " + nim,
                  "Last login": new Date
                })
              },
              html: function(){
                res.render('student/home', {title: "Dashboard ", nim:nim})
              }
            })
          } else {
            console.log('error update last_login')
          }
        }
      )
        } else {
          console.log('password wrong')
          res.json({
            "Status":"Error",
            "Message":"Wrong password"
          })
        }
      } else {
        console.log('Student not activated')
        res.json({
          "Status":"Error",
          "Message":"Student not activated. Please activate your account first"
        })
      }
    } else {
      console.log('NIM not found')
      res.json({
        "Status":"Error",
        "Message":"Student not found"
      })
    }
  })
}

exports.stdLogout = function(req, res){
  req.session.destroy(function(err){
    if(err){
        console.log(err);
    } else {
        res.json({
          "Status":true,
          "Message":"Logged out"
        })
    }
  });
}
