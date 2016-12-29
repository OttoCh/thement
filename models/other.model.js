var mongoose = require('mongoose')

var Schema = mongoose.Schema

var userSchema = new Schema ({
  username: String,
  email: String,
  password: String,
  registered: Date,
  last_login: Date,
  role: String
})

module.exports = mongoose.model('User', userSchema)
