"use strict"

var express   = require('express'),
    funcs     = require('../middlewares/funcs'),
    router    = express.Router()

router.get('/', function(req, res){
  let msg = 'test'
  let output = funcs.jsonOutput(msg)
  console.log(output)
  res.render('static/home', {title:"Homepage"})
})

module.exports = router
