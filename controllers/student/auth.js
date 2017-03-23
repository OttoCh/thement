/*
  REFACTOR :
  1. model distinguish  [-]
  2. async              [-]
*/

"use strict"

var express       = require('express'),
    request       = require('request'),
    app           = express(),
    funcs         = require('../../middlewares/funcs'),
    queries       = require('../../models/query.student')

var baseurl       = require('../../config/baseurl'),
    baseurl       = baseurl.root + 'student'

exports.stdLogin = function(req, res){
  // TODO: Login with token, generate random strings and numbers
  /*
    Example: PAYLOAD VALUES
    1. User identification  : ID, Display name, avatar, NIM
    2. Token metadata       : IssuedAt, expires, session ID
  */
  let nim     = req.body.nim,
      pass    = req.body.password, 
      caption = 'Student'
  queries.getStudentByNIM(nim, function(err, found){
    let error
    if(found){
      if (found.is_active == true){
        let decrypted = funcs.decryptTo(found.password)
        if(pass == decrypted){
          let nim = found.nim
          req.session.student = nim
          // all is good, redirect to homepage
          res.redirect('./home')
          } else {
            error = 'Wrong password'
            res.render('student/login', {title:"Student login", caption, error, baseurl})
          }
        } else {
          error = 'Account not activated, yet'
          res.render('student/login', {title:"Student login", caption, error, baseurl})
        }
      } else {
        error = 'User not found'
        res.render('student/login', {title:"Student login", caption, error, baseurl})
    }
  })
}

exports.stdLogout = function(req, res){
  let nim = req.session.student
  req.session.destroy(function(err){
    if(!err){
     queries.updateLastLogin(nim, function(err){
        try{
          res.redirect('./login')
        } catch(err){
          throw err
        }
      })
    } else {
      postError()
    }
  })
}

// ALL FUNCTIONS
function postError(err){
  console.log('Error occured : ', err)
}