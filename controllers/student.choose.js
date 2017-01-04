
exports.getLecturers = function(req, res){
  let nim = req.session.student
  res.render('student/lecturers', {title:"All lecturers", nim:nim})
}
