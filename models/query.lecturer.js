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
  }
}



