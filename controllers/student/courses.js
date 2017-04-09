var student   = require('../../models/student'),
    lecturer  = require('../../models/lecturer'),
    funcs     = require('../../middlewares/funcs'),
    queries   = require('../../models/query.student')

var baseurl       = require('../../config/baseurl'),
    baseurl       = baseurl.root + 'student'

var course_wajib    = require('../../test/wajib.json')

exports.getCourses = function(req, res){
    let wajibs = course_wajib
    res.render('student/courses/overview', {title:"Courses", baseurl, wajibs})
}