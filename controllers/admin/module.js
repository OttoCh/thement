"use strict"

var express       = require('express'),
    Admin         = require('../../models/admin'),
    Std           = require('../../models/student'),
    Lect          = require('../../models/lecturer'),
    funcs         = require('../../middlewares/funcs'),
    winston       = require('winston'),
    app           = express()

const baseurl     = 'http://localhost:3500/admin'
const roles       = ['super','operator','kaprodi']

exports.getIndex = function(req, res){
  res.redirect(baseurl+'/login')
}

exports.getLoginPage = function(req, res){
  let admin = req.session.admin
  if(admin){
    res.redirect('./home')
  } else {
    res.render('admin/login', {title:"Login Admin"})
  }
}

exports.postLogin = function(req, res){
  let pass = req.body.password
  let user = req.body.username
  let message
  console.log('login with user : ' + user + ' and pass : ' + pass)
  winston.log('info', 'Hi in login post')
  Admin.findOne({role:user}, function(err, found){
    if(found){
      switch (user) {
        case 'super': console.log('admin login as', user)

          break;
        case 'kaprodi': console.log('admin login as', user)

          break;
        case 'operator': console.log('admin login as', user)

          break;
        default: console.log('admin not detected')
      }
      // check if initial pass is correct
      let init_pass = found.role + '123'
      console.log('init pass : ', init_pass)
      if(pass == init_pass){
        // correct, redirect to change pass with the secure one
        req.session.admin = user
        console.log('Login as ', req.session.admin)
        res.redirect(baseurl+'/home')
      } else {
        res.status(400).send('wrong password')
      }
      message = 'welcome to Dashboard' + user
    } else {
      console.log('ADMIN NOT DETECTED')
      message = 'NOT AUTHORIZED ACCESS!'
      res.status(400).send('admin not found')
    }
  })
}

exports.getHome = function(req, res){
  let admin = req.session.admin
  if(admin){
    Admin.findOne({role:admin}, function(e, a){
      // count all lecturers
          Lect.count({}, function(e, lecturers){
            let nLects = lecturers      
            // count all students
            Std.count({}, function(e, all){
              let nStd = all
              console.log("total : ", nStd)
              // count student where is_accepted is true
            Std.count({"is_accepted":true}, function(e, count){
              let nAccepted = count
              console.log('accepted : ', nAccepted)
              let precenAccept = (nAccepted/nStd) * 100
              res.render('admin/home', {title:"Dashboard", admin, a, nStd, nAccepted, precenAccept, nLects})
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
