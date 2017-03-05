var mongoose = require('mongoose')

var Schema = mongoose.Schema

var studentSchema = new Schema ({
  nim: Number,
  email: String,
  password: String,
  registered: Date,
  ipk: Number,
  last_login: Date,
  is_active: Boolean,
  is_choose: Boolean,
  is_accepted: Boolean,
  supervisor: String,
  activation_link: String,
  passwordreset_link: String,
  has_resetpass: Boolean,
  inactive_password: String,
  notifs: [],
  notif_seen: Boolean,
  profile: {
    first_name: String,
    last_name: String,
    gender: String,
    birthday: String,
    address: String,
    img_path: String,
    img_url: String
  }
})

module.exports = mongoose.model('Student', studentSchema)
