"use strict"

var express       = require('express'),
    request       = require('request'),
    app           = express(),
    funcs         = require('../../middlewares/funcs'),
    Student       = require('../../models/student')

var baseurl       = require('../../config/baseurl'),
    baseurl       = baseurl.root + 'student'

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
        let decrypted = funcs.decryptTo(found.password)
        if(pass == decrypted){
          let nim = found.nim
          req.session.student = nim
          res.redirect('./home')
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
              res.render('student/login', {title:"Student login", caption, code, baseurl})
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
            res.render('student/login', {title:"Student login", caption, code, baseurl})
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
          res.render('student/login', {title:"Student login", caption, code, baseurl})
        }
      })
    }
  })
}

exports.stdLogout = function(req, res){
  let nim = req.session.student
  req.session.destroy(function(err){
    if(err){
        console.log(err);
    } else {
        Student.update({nim:nim},{$set: {
          last_login: new Date()
          },
        }, function(e,s){
          res.format({
            json: function(){
              res.send({
                status:true,
                message: "Logged out"
              })
            },
            html: function(){
              console.log(nim)
              res.redirect('./login')
            }
          })
        }
      )
    }
  });
}
