var mongoose = require('mongoose')

var Schema = mongoose.Schema

var lecturerSchema = new Schema ({
  name: String,
  username: String,
  kk: String,
  kk_initial: String,
  img_url: String,
  oldpass: String,
  newpass: String,
  last_login: Date,
  notif_seen: Boolean,
  passwordreset_link: String,
  std_limit: Number,
  candidates: [],
  students: [],
  notifs: [],
  educations: {},
  announcements: []
})

module.exports = mongoose.model('Lecturer', lecturerSchema)
