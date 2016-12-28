var express   = require('express'),
    router    = express.Router()

var student   = require('../modules/student.module')
var headers   = require('../credentials/headers')

router.use(function(req, res, next){
  console.log('%s %s [%s] %s', req.method, req.url, res.statusCode.toString(), headers.headers)
  next()
})

router.get('/', student.getIndex)

module.exports = router
