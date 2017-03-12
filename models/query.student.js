"use strict"

// load all models
const   Std    = require('../models/student'),
        Msg    = require('../models/message'),
        Rep    = require('../models/report')

module.exports = {
    /* STUDENTS */
    // get all students
    getAllStudents: function(cb){
        Std.find({}, cb)
    },

    // get student by NIM
    getStudentByNIM: function(nim, cb){
        Std.find({nim:nim}, function(err, student){
            cb(null, student[0])
        })
    },

    // get student by activation link
    getStudentByLink: function(link, cb){
        Std.find({activation_link:link}, function(err, student){
            cb(null, student[0])
        })
    },

    // get student by password reset link
    getStudentByPassLink: function(link, cb){
        Std.find({passwordreset_link:link}, function(err, student){
            cb(null, student[0])
        })
    }
}