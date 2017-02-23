"use strict"

var express       = require('express'),
    Admin         = require('../models/admin'),
    funcs         = require('../middlewares/funcs'),
    app           = express()

const baseurl     = 'http://localhost:3500/admin'
const roles       = ['super','operator','kaprodi']

exports.getIndex = function(req, res){
  res.redirect(baseurl+'/login')
}

exports.getLoginPage = function(req, res){
  res.render('admin/login', {title:"Login Admin"})
}

exports.postLogin = function(req, res){
  let pass = req.body.password
  let user = req.body.username
  let message
  console.log('login with user : ' + user + ' and pass : ' + pass)
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
      message = 'welcome to Dashboard' + user
    } else {
      console.log('ADMIN NOT DETECTED')
      message = 'NOT AUTHORIZED ACCESS!'
    }
    res.render('admin/home', {title:"Dashboard", user:user})
  })
}

exports.getHome = function(req, res){
  res.render('admin/home', {title:"Dashboard"})
}
