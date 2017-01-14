var mongoose = require('mongoose')

var Schema = mongoose.Schema

var lecturerSchema = new Schema ({
  name: String,
  username: String,
  kk: String,
  kk_initial: String,
  oldpass: String,
  newpass: String,
  passwordreset_link: String,
  candidates: [],
  students: []
})

module.exports = mongoose.model('Lecturer', lecturerSchema)
