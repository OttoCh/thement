var db = require('./student')
// create new user

// get all users
exports.all = function(cb){
  db.find({}, cb)
}

// get user by nim
exports.get = function(nim, cb){
  db.find({nim:nim}, function(err, students){
    if(err) return cb(err)
    cb(null, students[0])
  })
}
