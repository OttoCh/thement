var db        = require('./student'),
    key       = '99u9d9h23h9fas9ah832hr',
    encryptor = require('simple-encryptor')(key),
    possible  = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

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
