var db        = require('./lecturer'),
    Adm       = require('./admin'),
    Std       = require('./student'),
    Msg       = require('./message'),
    Rep       = require('./report')


module.exports = {
  /* ACCOUNTS */
  // get all lecturers
  all: function(cb){
    db.find({}, cb)
  },

  // get lecturer by username
  getLecturerByUsername: function(username, cb){
    db.find({username:username}, function(err, lecturers){
      if(err) return cb(err)
      cb(null, lecturers[0])
    })
  },

  // add NIM to candidates
  updateLecturerCandidates: function(username, candidate, cb){
    db.update({username:username},{$push: {candidates: candidate},},function(err, updated){
        if(err) return cb(err)
        cb(null, updated>0)
    })
  },

  // add notif to lecturer
  addNotif: function(username, nLength, msgLec, cb){
    db.update({username:username},{$set:{notif_seen:false},$push:{notifs:{"id":nLength,"notif":msgLec,"date":new Date()}},}, function(err, updated){
      if(err) return cb(err)
      cb(null, updated>0)
    })
  },

  // increment page views
  incrementViews: function(username, cb){
    db.update({username:username},{"$inc":{pageviews:1},},function(err, updated){
      if(err) return cb(err)
      cb(null, updated)
    })
  },

  // set notif to seen
  seenNotif: function(username, cb){
    db.update({username:username},{$set:{notif_seen:true},},function(err, updated){
      if(err) return cb(err)
      cb(null, updated)
    })
  },

  // remove all notifs
  removeAllNotifs: function(username, cb){
    db.update({username:username},{$set:{notifs:[]},},function(err, removed){
      if(err) return cb(err)
      cb(null, removed)
    })
  },

  // update password
  updatePassword: function(username, newpass, cb){
    db.update({username:username},{$set:{newpass:newpass},},function(err, updated){
      if(err) return cb(err)
      cb(null, updated)
    })
  },

  // remove a candidate
  removeCandidate: function(username, nimToRemove, cb){
    db.update({username:username},{$pull:{candidates:nimToRemove},},function(err, removed){
      if(err) return cb(err)
      cb(null, removed)
    })
  },

  // accept a student
  acceptStudent: function(username, final_we, nimToAccept, cb){
    db.update({username:username},{$set:{std_weight:final_we},$push:{students:nimToAccept},},function(err, accepted){
      if(err) return cb(err)
      cb(null, accepted)
    })
  },

  // update last login
  updateLastLogin: function(username, cb){
    db.update({username:username},{$set:{last_login:new Date()},},function(err, updated){
      if(err) return cb(err)
      cb(null, updated)
    })
  },

  /* MESSAGE */
  // get message by lecturer
  getMessageByLecturer: function(lecturer, cb){
    Msg.find({members:{$all:[lecturer]},$and:[{has_seen_lecturer:false}]},function(err, found){
      if(err) return cb(err)
      cb(null, found)
    })
  },

  // get broadcast message by lecturer
  getBroadcastByLecturer: function(lecturer, cb){
    Msg.findOne({lecturer:lecturer},function(err, bc){
      if(err) return cb(err)
      cb(null, bc)
    })
  },

  // update broadcast message's member
  updateBroadcast: function(lecturer, nimToAdd, cb){
    Msg.update({lecturer:lecturer},{$push:{members:nimToAdd},},function(err, updated){
      if(err) return cb(err)
      cb(null, updated)
    })
  },

  // get message by author
  getMessageByStudent: function(nim, cb){
    Msg.aggregate({$match:{"nim":nim}}, {$unwind:"$messages"},{$match:{"messages.author":nim.toString()}},function(err, found){
      if(err) return cb(err)
      cb(null, found)
    })
  },

  // get message where author is lecturer
  getMessageFromLecturer: function(nim, superv, cb){
    Msg.aggregate({$match:{"nim":nim}}, {$unwind:"$messages"},{$match:{"messages.author":superv}},function(err, found){
      if(err) return cb(err)
      cb(null, found)
    })
  },

  seenByLecturer: function(nim, cb){
    Msg.update({nim:nim},{$set:{has_seen_lecturer:true},},function(err, seen){
      if(err) return cb(err)
      cb(null, seen)
    })
  },

  sendMessage: function(nim, msgLength, lecturer, msgBody, cb){
    Msg.update({nim:nim},{$set:{has_seen_std:false},$push:{messages:{"id":msgLength,"author":lecturer,"body":msgBody, "date_created":new Date()}},},function(err, sent){
      if(err) return cb(err)
      cb(null, sent)
    })
  },

  sendBroadcast: function(lecturer, bcLength, message, cb){
    Msg.update({lecturer:lecturer},{$push:{messages:{"id":bcLength,"author": lecturer, "body": message,"date_created": new Date(),"has_seen_by": []}},},function(err, sent){
      if(err) return cb(err)
      cb(null, sent)
    })
  },

  /* REPORT */
  // approve student's report
  approveReport: function(nim, cb){
    Rep.update({nim:nim},{$set:{is_create:false, is_approved:true},},function(err, approved){
      if(err) return cb(err)
      cb(null, approved)
    })
  },

  /* ADMIN */
  // get all announcements
  getAllAnnouncements: function(cb){
        Adm.aggregate({$match:{"role":"operator"}},{$unwind:"$announcements"},{$match:{$or:[{"announcements.to":"lecturers"},{"announcements.to":"all"}]}},function(err, anns){
            if(err) return cb(err)
            cb(null, anns)
        })
    },

  seenByAnnouncement: function(idRead, lec, cb){
    Adm.update({role:"operator", "announcements.id":idRead},{"$push":{"announcements.$.seen_by":lec},},function(err, seen){
      if(err) return cb(err)
      cb(null, seen)
    })
  }

}
