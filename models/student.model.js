var mongoose = require('mongoose')

var Schema = mongoose.Schema

var studentSchema = new Schema ({
  nim: Number,
  email: String,
  password: String,
  registered: Date,
  is_active: Boolean,
  activation_link: String,
  passwordreset_link: String,
  has_resetpass: Boolean,
  inactive_password: String
})

module.exports = mongoose.model('Student', studentSchema)
