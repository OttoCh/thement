var express       = require('express'),
    session       = require('express-session'),
    MongoStore    = require('connect-mongo')(session),
    mongoose      = require('mongoose')
    Student       = require('../models/student.model'),
    app           = express()

var key = '99u9d9h23h9fas9ah832hr'
var encryptor = require('simple-encryptor')(key)

exports.getIndex = function(req, res){
  res.json({
    "Status":"OK",
    "Message":"api/v1/student"
  })
}

exports.addStudent = function(req, res){

  var text, str
  function makeid(str){
  	text = str
    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
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
  std.has_resetpass       = false
  std.is_active           = false
  std.activation_link     = link
  std.passwordreset_link  = link2

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
            "Message":"Student created",
            "Crypted": encrypted
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

exports.stdLogin = function(req, res){
  let nim   = req.body.nim,
      pass  = req.body.password
  Student.findOne({nim: nim}, function(err, found){
    if(found){
      if (found.is_active == true){
        console.log('check for decrypting')
        let decrypted = encryptor.decrypt(found.password)
        if(pass == decrypted){
          req.session.student = found.nim
          console.log('Logged in as ', req.session.student)
          res.json({
            "Status":"OK",
            "Message":"Logged in"
          })
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
  console.log('logout')
}
