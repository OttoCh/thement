var mongoose = require('mongoose')

var Schema = mongoose.Schema

var lecturerSchema = new Schema ({
  name: String,
  username: String,
  kk: String,
  kk_initial: String,
  oldpass: String,
  newpass: String,
  last_login: Date,
  notif_seen: Boolean,
  passwordreset_link: String,
  candidates: [],
  students: [],
  notifs: []
})

module.exports = mongoose.model('Lecturer', lecturerSchema)
