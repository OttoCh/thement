var express   = require('express'),
    router    = express.Router()

router.use(function(req, res, next){
  console.log('%s %s [%s]', req.method, req.url, res.statusCode.toString())
  next() // go to next route and not stop here
})

router.get('/', function(req, res){
  res.json({
    "Status":"OK",
    "Message":"Homepage"
  })
})

module.exports = router
