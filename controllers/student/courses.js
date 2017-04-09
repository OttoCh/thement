var student   = require('../../models/student'),
    lecturer  = require('../../models/lecturer'),
    funcs     = require('../../middlewares/funcs'),
    queries   = require('../../models/query.student')

var baseurl       = require('../../config/baseurl'),
    baseurl       = baseurl.root + 'student'

var course_wajib    = require('../../test/wajib.json'),
    course_pt       = require('../../test/pt.json')

exports.getCourses = function(req, res){
    let wajibs  = course_wajib,
        pts     = course_pt,
        nim     = req.session.student
    res.render('student/courses/overview', {title:"Courses", baseurl, wajibs, pts, nim})
}

exports.getMyCourses = function(req, res){
    let nim = req.session.student
    res.render('student/courses/my', {title:"My Courses", baseurl})
}