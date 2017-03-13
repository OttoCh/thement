"use strict"

// load all modals
const   Adm    = require('../models/admin'),
        Lec    = require('../models/lecturer'),
        Std    = require('../models/student'),
        Msg    = require('../models/message'),
        Rep    = require('../models/report')

module.exports = {
    // STUDENTS
    // get all students
    getAllStudents: function(cb){
        Std.find({}, cb)
        return cb
    },

    // get student by NIM
    getStudentByNIM: function(nim, cb){
        Std.find({nim:nim}, function(err, student){
            cb(null, student[0])
        })
    }
}