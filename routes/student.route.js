var express   = require('express'),
    router    = express.Router()

// load modules
//var student   = require('../modules/student.module')

router.use(function(req, res, next){
  console.log('%s %s [%s]', req.method, req.url, res.statusCode.toString())
  next() // go to next route and not stop here
})

router.get('/', function(req, res){
  res.json({
    "Status":"OK",
    "Message":"api/v1/student"
  })
})

module.exports = router
