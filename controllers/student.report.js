// load lecturers
var lect      = require('../models/lecturer.model'),
    student   = require('../models/student'),
    lecturer  = require('../models/lecturer'),
    funcs     = require('../middlewares/funcs')
const baseurl = 'http://localhost:3500/student'

var hiding     = 'hide'
var chooseCode = ''

exports.createReport = function(req, res){
  res.send('create single report')
}

exports.getAllReports = function(req, res){
  res.send('get all reports')
}

exports.getSingleReport = function(req, res){
  let id = req.params.id
  res.send('get single report : '+ id)
}

exports.updateReport = function(req, res){
  res.send('update single report')
}

exports.removeAllReports = function(req, res){
  res.send('remove all reports')
}

exports.removeSingleReport = function(req, res){
  res.send('remove single report')
}
