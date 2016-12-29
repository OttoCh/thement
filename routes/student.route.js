var express   = require('express'),
    router    = express.Router()

router.get('/', function(req, res){
  res.render('student/login', {title: "Student login"})
})

module.exports = router
