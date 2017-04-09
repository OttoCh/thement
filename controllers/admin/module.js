"use strict"

var express       = require('express'),
    Admin         = require('../../models/admin'),
    Std           = require('../../models/student'),
    Lect          = require('../../models/lecturer'),
    funcs         = require('../../middlewares/funcs'),
    adm_query     = require('../../models/query.admin'),
    winston       = require('winston'),
    app           = express()

var baseurl       = require('../../config/baseurl'),
    root_url      = baseurl.root,
    baseurl       = baseurl.root + 'admin'
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
  adm_query.getAdminByRole(user, function(err, found){
    if(found){
      // check if initial pass is correct
      let init_pass = found.role + '123'
      if(pass == init_pass){
        req.session.admin = user

        // switch admin
        switch(user){
          case 'operator':
            res.redirect(root_url+'operator/home')
          break;

          case 'kaprodi':
            res.redirect(root_url+'kaprodi/home')
          break;

          case 'super':
            res.redirect(root_url+'super/home')
          break;

          default: 
          break;
        }
      } else {
        res.status(400).send('wrong password')
      }
      message = 'welcome to Dashboard' + user
    } else {
      console.log('[ADMIN] Unauthorized access!')
      message = 'NOT AUTHORIZED ACCESS!'
      res.status(400).send('admin not found')
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

exports.getProfile = function(req, res){
  res.render('admin/profile')
}

exports.getSettings = function(req, res){
  res.render('admin/settings')
}