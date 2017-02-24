"use strict"

var express   = require('express'),
    funcs     = require('../middlewares/funcs'),
    router    = express.Router()

router.get('/', function(req, res){
  // get local ip address
  let localIP = funcs.getLocalIP()
  console.log('INI LOKAL IP : ', localIP)
  let msg = 'test'
  let output = funcs.jsonOutput(msg)
  console.log(output)
  res.render('static/home', {title:"Homepage"})
})

module.exports = router
