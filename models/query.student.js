"use strict"

// load all models
const   Std    = require('../models/student'),
        Msg    = require('../models/message'),
        Rep    = require('../models/report'),
        Adm    = require('../models/admin')

module.exports = {
    /* == ACCOUNT STARTS == */
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

    // get student by NIM or email
    getStudentByNIMorEmail: function(nim, email, cb){
        Std.findOne({$and:[{nim:nim},{email:email}]},function(err, found){
            if(err) return cb(err)
            cb(null, found)
        })
    },

    // update student last login
    updateLastLogin: function(nim, cb){
        Std.update({nim:nim}, {last_login: new Date()}, function(err, updated){
            if(err) return cb(err)
            cb(null, updated)
        })
    },

    // update student's profile
    updateProfile: function(nim, formFullname, formNickname, formGender, formAddress, formBirthday, formIpk, cb){
        Std.update({nim:nim},{$set:{'profile.fullname':formFullname, 'profile.nickname':formNickname, 'profile.gender':formGender, 'profile.address':formAddress,'profile.birthday':formBirthday,ipk:formIpk},},function(err, updated){
            if(err) return cb(err)
            cb(null, updated)
        })
    },

    // update student's password
    updatePassword: function(nim, encrypted, cb){
        Std.update({nim:nim},{$set:{password:encrypted},},function(err, updated){
            if(err) return cb(err)
            cb(null, updated)
        })
    },

    // activate reset password via email
    resetPassword: function(nim, encrypted, cb){
        Std.update({nim:nim},{$set:{password:encrypted, has_resetpass:true},},function(err, reset){
            if(err) return cb(err)
            cb(null, reset)
        })
    },

    // choose lecturer by username
    chooseLecturer: function(nim, lecturerChosen, cb){
        Std.update({nim:nim},{$set:{is_choose:true,is_accepted:false,supervisor:lecturerChosen},},function(err, updated){
            if(err) return cb(err)
            cb(null, updated)
        })
    },

    // activate student
    activateStudent: function(nim, cb){
        Std.update({nim:nim},{$set:{is_active:true},},function(err, activated){
            if(err) return cb(err)
            cb(null, activated)
        })
    },

    // send reset password link
    sendResetPasswordLink: function(nimToReset, inactive_pass, cb){
        Std.update({nim:nimToReset},{$set:{inactive_password:inactive_pass},},function(err, sent){
            if(err) return cb(err)
            cb(null, sent)
        })
    },

    // add notif
    addNotif: function(nim, notifLength, msg, cb){
        Std.update({nim:nim},{$set:{notif_seen:false},$push:{notifs:{"id":notifLength, "notif":msg, "date":new Date()}},},function(err,updated){
            if(err) return cb(err)
            cb(null)
        })
    },

    // update notif seen
    updateSeenNotif: function(nim, cb){
        Std.update({nim:nim}, {$set:{notif_seen:true},},function(err, updated){
            if(err) return cb(err)
            cb(null, updated)
        })
    },

    // remove all notifs
    removeAllNotifs: function(nim, cb){
        Std.update({nim:nim},{$set:{notifs:[]},},function(err, updated){
            if(err) return cb(err)
            cb(null, updated)
        })
    },

    // add milestone
    addMilestone: function(nim, category, milesLength, cb){
        Std.update({nim:nim},{$push:{milestones:{"id":milesLength,"date":new Date(),"category":category}},},function(err, updated){
            if(err) return cb(err)
            cb(null, updated)
        })
    },

    // removed from candidate by lecturer
    removedFromCandidates: function(nimToRemove, cb){
        Std.update({nim:nimToRemove},{$set:{supervisor:"",is_choose:false, is_accepted:false},},function(err, removed){
            if(err) return cb(err)
            cb(null, removed)
        })
    },

    // accepted by lecturer
    acceptedByLecturer: function(nimToAccept, cb){
        Std.update({nim:nimToAccept},{$set:{is_accepted:true},},function(err, accepted){
            if(err) return cb(err)
            cb(null, accepted)
        })
    },

    // get full name
    getStudentProfile: function(intStds, cb){
        Std.find({nim:{$in:intStds}},function(err, profile){
            if(err) return cb(err)
            cb(null, profile)
        })
    },
    /* == ACCOUNT ENDS == */

    /* == MESSAGE STARTS == */
    // get message by NIM
    getMessageByNIM: function(nim, cb){
        Msg.findOne({nim:nim},function(err, msgs){
            if(err) return cb(err)
            cb(null, msgs)
        })
    },

    // get message by supervisor (broadcast)
    getMessageBySupervisor: function(supervisor, cb){
        Msg.findOne({lecturer:supervisor}, function(err, msg){
            if(err) return cb(err)
            cb(null, msg)
        })
    },

    // set has_seen_std to true
    updateHasSeen: function(nim, cb){
        Msg.update({nim:nim},{$set:{has_seen_std:true},},function(err, updated){
            if(err) return cb(err)
            cb(null, updated)
        })
    },

    // get inbox by nim
    getInboxByNIM: function(nim, username, cb){
        Msg.aggregate({$match:{"nim":nim}},{$unwind:"$messages"},{$match:{"messages.author":username}},function(err,inb){
            if(err) return cb(err)
            cb(null, inb)
        })
    },

    // get outbox by nim
    getOutboxByNIM: function(nim, nimStr, cb){
        Msg.aggregate({$match:{"nim":nim}},{$unwind:"$messages"},{$match:{"messages.author":nimStr}},function(err,out){
            if(err) return cb(err)
            cb(null, out)
        })
    },

    // get broadcast by supervisor
    getBroadcastBySupervisor: function(username, cb){
        Msg.findOne({lecturer:username},function(err, bc){
            if(err) return cb(err)
            cb(null, bc)
        })
    },

    // remove all messages (inbox+outbox)
    removeAllMessages: function(nim, cb){
        Msg.update({nim:nim},{$set:{messages:[]},},function(err, removed){
            if(err) return cb(err)
            cb(null, removed)
        })
    },

    // send message to lecturer
    sendMessage: function(nim, msgLength, msgBody, cb){
        Msg.update({nim:nim},{$set:{has_seen_lecturer:false},$push:{messages:{"id":msgLength,"author":nim.toString(),"body":msgBody,"date_created":new Date()}},},function(err, sent){
            if(err) return cb(err)
            cb(null, sent)
        })
    },

    // add user to has_seen_by
    seenBy: function(username, bc_id, nimstr, cb){
        Msg.update({lecturer:username, "messages.id":Number(bc_id)},{"$push":{"messages.$.has_seen_by":nimstr}},function(err, seen){
            if(err) return cb(err)
            cb(null, seen)
        })
    },
    /* == MESSAGE ENDS == */

    /* == REPORT STARTS == */
    // get report by nim
    getReportbyNIM: function(nim, cb){
        Rep.findOne({nim:nim}, function(err, reps){
            if(err) return cb(err)
            cb(null, reps)
        })
    },

    // add report
    addReport: function(nim, reportID, reportTitle, reportBody, cb){
        Rep.update({nim:nim},{$set:{is_create:true, is_approved:false}, $push:{reports:{id:reportID,title:reportTitle,body:reportBody,last_edit:new Date(),approved:"",file_name:"No file, yet",file_location:"#"}},},function(err, updated){
            if(err) return cb(err)
            cb(null, updated)
        })
    },

    setReportFalse: function(nim, cb){
        Std.update({nim:nim},{$set:{report_status:false},},function(err, updated){
            if(err) return cb(err)
            cb(null, updated)
        })
    },

    // get single report (to edit)
    getSingleReport: function(nim, reportID, cb){
        Rep.findOne({nim:nim}, {"reports":{"$elemMatch":{"id":reportID}}}, function(err, found){
            if(err) return cb(err)
            cb(null, found)
        })    
    },

    // update report
    updateReport: function(nim, reportID, reportTitle, reportBody, cb){
        Rep.update({nim:nim, "reports.id":reportID},{"$set":{"reports.$.title":reportTitle, "reports.$.body":reportBody, "reports.$.last_edit":new Date()},},function(err, updated){
            if(err) return cb(err)
            cb(null, updated)
        })
    },

    // remove all reports
    removeAllReports: function(nim, cb){
        Rep.update({nim:nim},{$set:{reports:[]},},function(err, removed){
            if(err) return cb(err)
            cb(null, removed)
        })
    },
    /* == REPORT ENDS == */

    /* == ADMIN STARTS == */
    // get al announcements
    getAllAnnouncements: function(cb){
        Adm.aggregate({$match:{"role":"operator"}},{$unwind:"$announcements"},{$match:{$or:[{"announcements.to":"students"},{"announcements.to":"all"}]}},function(err, anns){
            if(err) return cb(err)
            cb(null, anns)
        })
    },

    // seen by announcement
    seenByAnnouncement: function(idRead, nim, cb){
        Adm.update({role:"operator", "announcements.id":idRead},{"$push":{"announcements.$.seen_by":nim},},function(err, read){
            if(err) return cb(err)
            cb(null, read)
        })
    }
    /* == ADMIN ENDS == */
}