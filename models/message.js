var mongoose = require('mongoose')

var Schema = mongoose.Schema

var messageSchema = new Schema ({
  members: [],
  messages: [],
  has_seen_std: Boolean,
  has_seen_lecturer: Boolean,
  has_seen_by: [],
  nim: Number,
  lecturer: String
})

module.exports = mongoose.model('Message', messageSchema)
