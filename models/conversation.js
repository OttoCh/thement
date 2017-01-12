var mongoose = require('mongoose')

var Schema = mongoose.Schema

var convSchema = new Schema ({
  from: String,
  to: String,
  messages: [{
    id: Number,
    date: Date,
    message: String,
    has_seen: Boolean
  }]
})

module.exports = mongoose.model('Conversation', convSchema)
