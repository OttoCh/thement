"use strict"

var express   = require('express'),
    funcs     = require('../middlewares/funcs'),
    router    = express.Router()

router.get('/', function(req, res){
  // flash message
  req.flash('info', 'Welcome')
  res.render('static/home', {title:"Homepage"})
})

module.exports = router
