var express   = require('express'),
    router    = express.Router()

var student   = require('../modules/student.module')

router.use(function(req, res, next){
  console.log('%s %s [%s]', req.method, req.url, res.statusCode.toString())
  next()
})

router.get('/', student.getIndex)
router.post('/', student.addStudent)
router.post('/login', student.stdLogin)
router.get('/activation/:link', student.activateStudent)

module.exports = router
