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
    },

    // update student last login
    updateLastLogin: function(nim, cb){
        Std.update({nim:nim}, {last_login: new Date()}, function(err, updated){
            if(err) return cb(err)
            cb(null, updated)
        })
    },

    // choose lecturer
    chooseLecturer: function(nim, lecturerChosen, cb){
        Std.update({nim:nim},{$set:{is_choose:true,is_accepted:false,supervisor:lecturerChosen},},function(err, updated){
            if(err) return cb(err)
            cb(null, updated>0)
        })
    },

    // add notif
    addNotif: function(nim, notifLength, msg, cb){
        Std.update({nim:nim},{$set:{notif_seen:false},$push:{notifs:{"id":msg, "notif":notifLength, "date":new Date()}},},function(err,updated){
            if(err) return cb(err)
            cb(null, updated>0)
        })
    }
}