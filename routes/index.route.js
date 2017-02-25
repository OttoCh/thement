"use strict"

var express   = require('express'),
    funcs     = require('../middlewares/funcs'),
    router    = express.Router()

router.get('/', function(req, res){
  res.render('static/home', {title:"Homepage"})
})

module.exports = router
