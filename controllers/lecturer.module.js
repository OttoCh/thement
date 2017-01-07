var Lect        = require('../models/lecturer')
const baseurl   = 'http://localhost:3500/lecturer'

exports.getIndex = function(req, res){
  res.redirect('lecturer/login')
}

exports.getLoginPage = function(req, res){
  res.render('lecturer/login', {title:"Lecturer login page", baseurl:baseurl})
}

exports.getForgetPassPage = function(req, res){
  res.render('lecturer/forget-pass', {title:"Forget password", baseurl:baseurl})
}

exports.postLogin = function(req, res){
  let user  = req.body.username
  let pass  = req.body.password
  Lect.findOne({username:user}, function(e, found){
    if(found){
      console.log('username found')
      if(pass == found.oldpass){
        // logged in, redirect to change pass
        console.log('logged in, change password immediately')
        res.json({
          status: true,
          message: "Logged in"
        })
      } else {
        console.log('wrong password')
        res.json({
          status: false,
          message: 'wrong password'
        })
      }
    } else {
      console.log('NOT FOUND')
      res.json({
        status: false,
        message: 'username not found'
      })
    }
  })
}
