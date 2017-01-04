// load lecturers
var lect = require('../models/lecturer.model')


exports.getLecturers = function(req, res){
  let nim = req.session.student
  lect.all(function(err, lecturers){
    res.render('student/lecturers', {title:"All lecturers", nim:nim, lecturers:lecturers})
  })
}

exports.getDetailLecturer = function(req, res){
  let nim = req.session.student
  lect.get(req.params.username, function(err, lecturer){
    res.render('student/lecturer-detail', {title:"Lecturer detail", nim:nim, lecturer:lecturer})
  })
}
