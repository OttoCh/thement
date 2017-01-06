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
