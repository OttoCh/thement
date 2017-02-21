var express   = require('express'),
    router    = express.Router()

router.get('/', function(req, res){
  res.render('static/home', {title:"Homepage"})
})

module.exports = router
