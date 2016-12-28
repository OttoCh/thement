var express       = require('express'),
    app           = express(),
    Student       = require('../models/student.model')

exports.getIndex = function(req, res){
  res.json({
    "Status":"OK",
    "Message":"api/v1/student"
  })
}

exports.addStudent = function(req, res){
  // generate random code for activation_link
  var text, str
  function makeid(str){
  	text = str;
    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for(var i=0; i<20; i++){
    	text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return (text);
  }
  let link = makeid('398hhces8dh8shd8ah')

  var std             = new Student()
  std.nim             = req.body.nim
  std.email           = req.body.email
  std.password        = req.body.password
  std.is_active       = false
  std.activation_link = link

  std.save(function(err){
    if(err){
      res.send(err)
    }
    else {
      res.json({
        "Status":"OK",
        "Message":"Student created",
        link
      })
    }
  })
}
