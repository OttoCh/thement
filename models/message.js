var mongoose = require('mongoose')

var Schema = mongoose.Schema

var messageSchema = new Schema ({
  members: [],
  has_seen: Boolean,
  messages: [],
  has_seen_std: Boolean,
  has_seen_lecturer: Boolean
})

module.exports = mongoose.model('Message', messageSchema)
