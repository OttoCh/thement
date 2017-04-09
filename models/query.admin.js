var Adm = require('./admin'),
    Std = require('./student'),
    Lec = require('./lecturer')

module.exports = {
    /* ALL */
    // get admin by role
    getAdminByRole: function(role, cb){
        Adm.findOne({role:role},function(err, found){
            if(err) return cb(err)
            cb(null, found)
        })
    },
    // count lecturers
    countLecturers: function(cb){
        Lec.count({},function(err, counted){
            if(err) return cb(err)
            cb(null, counted)
        })
    },

    // count lecturers that have student
    countLecturerHasStd: function(cb){
        Lec.count({"students":{$exists: true, $ne: []},},function(err, counted){
            if(err) return cb(err)
            cb(null, counted)
        })
    },

    // count students
    countStudents: function(cb){
        Std.count({}, function(err, counted){
            if(err) return cb(err)
            cb(null, counted)
        })
    },

    // count student that has supervisor
    countStudentHasLecturer: function(cb){
        Std.count({"is_accepted":true}, function(err, counted){
            if(err) return cb(err)
            cb(null, counted)
        })
    },

    // get all students
    getAllStudents: function(cb){
        Std.find({}, function(err, stds){
            if(err) return cb(err)
            cb(null, stds)
        })
    },

    // get student by NIM
    getStudentByNIM: function(nim, cb){
        Std.findOne({nim:nim},function(err, found){
            if(err) return cb(err)
            cb(null, found)
        })
    },

    // get all lecturers
    getAllLecturers: function(cb){
        Lec.find({}, function(err, lecs){
            if(err) return cb(err)
            cb(null, lecs)
        })
    },

    // get lecturer by username
    getLecturerByUsername: function(username, cb){
        Lec.findOne({username:username},function(err, found){
            if(err) return cb(err)
            cb(null, found)
        })
    },

    /* OPERATOR */
    // get announcements sent to students
    getAnnouncementToStudents: function(admin, cb){
        Adm.aggregate({$match:{"role":admin}},{$unwind:"$announcements"},{$match:{"announcements.to":"students"}},function(err, std){
            if(err) return cb(err)
            cb(null, std)
        })
    },

    // get announcements sent to lecturers
    getAnnouncementToLecturers: function(admin, cb){
        Adm.aggregate({$match:{"role":admin}},{$unwind:"$announcements"},{$match:{"announcements.to":"lecturers"}},function(err, std){
            if(err) return cb(err)
            cb(null, std)
        })
    },

    // send announcement
    sendAnnouncement: function(admin, annLength, result, body, cb){
        Adm.update({role:admin}, {$push:{"announcements":{"id":annLength,"to":result,"body":body,"date": new Date(),"seen_by":[]}},},function(err, sent){
            if(err) return cb(err)
            cb(null, sent)
        })
    },

    // verify TA 1
    verifyTA1: function(nim, superv, cb){
        Std.update({nim:nim},{$set:{ta1:{"status":"verified","date": new Date(),"supervisor":superv}},}, function(err, verified){
            if(err) return cb(err)
            cb(null, verified)
        })
    },

    // verify TA 2
    verifyTA2: function(nim, superv, cb){
        Std.update({nim:nim},{$set:{ta2:{"status":"verified","date": new Date(),"supervisor":superv}},}, function(err, verified){
            if(err) return cb(err)
            cb(null, verified)
        })
    },

    /* KAPRODI */

    /* SUPER */
    
}