// load lecturers
var lect      = require('../models/lecturer.model'),
    student   = require('../models/student'),
    lecturer  = require('../models/lecturer')
const baseurl = 'http://localhost:3500/student'

var hiding     = 'hide'
var chooseCode = ''

exports.getNotifs = function(req, res){
  res.send('all notifs')
}

exports.getSingleNotif = function(req, res){
  res.send('single notif')
}

exports.removeAllNotifs = function(req, res){
  res.send('remove all notifs')
}

exports.removeSingleNotif = function(req, res){
  res.send('remove single notif')
}
