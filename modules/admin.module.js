var express       = require('express'),
    Admin         = require('../models/other.model'),
    app           = express()

exports.getIndex = function(req, res){
  console.log('session : ', req.session.admin)
  res.json({
    "Status":"OK",
    "Message":"api/v1/admin"
  })
}
