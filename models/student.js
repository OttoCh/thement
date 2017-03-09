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
    fullname: String,
    nickname: String,
    gender: String,
    birthday: String,
    address: String,
    img_path: String,
    img_url: String
  },
  milestones: []
})

module.exports = mongoose.model('Student', studentSchema)
