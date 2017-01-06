// load lecturers
var lect      = require('../models/lecturer.model')
const baseurl = 'http://localhost:3500/student'

exports.getLecturers = function(req, res){
  let nim = req.session.student
  lect.all(function(err, lecturers){
    res.render('student/lecturers', {title:"All lecturers", nim:nim, lecturers:lecturers, baseurl:baseurl})
  })
}

exports.getDetailLecturer = function(req, res){
  let nim = req.session.student
  console.log(req.url)
  lect.get(req.params.username, function(err, lecturer){
    res.render('student/lecturer-detail', {title:"Lecturer detail", nim:nim, lecturer:lecturer, baseurl:baseurl})
  })
}

exports.postChooseLecturer = function(req, res){
  let nim = req.session.student
  let chosen = req.url
  res.send('url : ' + chosen)
}
