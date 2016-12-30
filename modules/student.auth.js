var express       = require('express'),
    request       = require('request'),
    app           = express(),
    key           = '99u9d9h23h9fas9ah832hr',
    encryptor     = require('simple-encryptor')(key),
    Student       = require('../models/student.model'),
    baseurl       = 'http://localhost:3500/student'

exports.stdLogin = function(req, res){
  // TODO: Login with token, generate random strings and numbers
  /*
    Example: PAYLOAD VALUES
    1. User identification  : ID, Display name, avatar, NIM
    2. Token metadata       : IssuedAt, expires, session ID
  */
  let nim   = req.body.nim,
      pass  = req.body.password
  var caption = 'Student'
  Student.findOne({nim: nim}, function(err, found){
    if(found){
      var code
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
                res.redirect('./home')
              }
            })
          } else {
            console.log('error update last_login')
          }
        }
      )
        } else {
          console.log('password wrong')
          res.format({
            json: function(){
              res.json({
                "Status":"Error",
                "Message":"Wrong password"
              })
            },
            html: function(){
              code = 'Password wrong'
              res.render('student/login', {title:"Student login", caption:caption, code:code, baseurl:baseurl})
            }
          })
        }
      } else {
        console.log('Student not activated')
        res.format({
          json: function(){
            res.json({
              "Status":"Error",
              "Message":"Account not activated yet"
            })
          },
          html: function(){
            code = 'Account not activated yet'
            res.render('student/login', {title:"Student login", caption:caption, code:code, baseurl:baseurl})
          }
        })
      }
    } else {
      console.log('NIM not found')
      res.format({
        json: function(){
          res.json({
            "Status":"Error",
            "Message":"NIM not found"
          })
        },
        html: function(){
          code = 'NIM not found'
          res.render('student/login', {title:"Student login", caption:caption, code:code, baseurl:baseurl})
        }
      })
    }
  })
}

exports.stdLogout = function(req, res){
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
