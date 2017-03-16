var mongoose = require('mongoose')

var Schema = mongoose.Schema

var adminSchema = new Schema ({
  id: String,
  role: String,
  pass: String,
  email: String,
  announcements: []
})

module.exports = mongoose.model('Admin', adminSchema)
