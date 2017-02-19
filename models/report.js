var mongoose = require('mongoose')

var Schema = mongoose.Schema

var reportSchema = new Schema ({
  nim: Number,
  supervisor: String,
  reports:[],
  is_approved: Boolean
})

module.exports = mongoose.model('Report', reportSchema)
