var db        = require('./lecturer')

// get all lecturers
exports.all = function(cb){
  db.find({}, cb)
}

// get user by nim
exports.get = function(username, cb){
  db.find({username:username}, function(err, lecturers){
    if(err) return cb(err)
    cb(null, lecturers[0])
  })
}
