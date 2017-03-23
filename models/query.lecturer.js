var db        = require('./lecturer')


module.exports = {
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
  }
}



