var mongoose = require('mongoose')

var Schema = mongoose.Schema

var messageSchema = new Schema ({
  members: [],
  has_seen: Boolean,
  messages: []
})

module.exports = mongoose.model('Message', messageSchema)
