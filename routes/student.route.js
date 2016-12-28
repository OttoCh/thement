var express   = require('express'),
    router    = express.Router()

var student   = require('../modules/student.module')

router.use(function(req, res, next){
  console.log('%s %s [%s]', req.method, req.url, res.statusCode.toString())
  next()
})

function isLoggedIn(req,res,next){
    if(!req.session.student){
      console.log('unauthorized access!')
      res.send('unauthorized access! please login first')
    } else {
      next();
    }
  }

router.get('/', student.getIndex)

router.post('/', student.addStudent)
router.post('/login', student.stdLogin)
router.post('/logout', student.stdLogout)

router.post('/resetpassword', student.requestPasswordChange)
router.post('/resetpassword/:link', student.activatePasswordChange)
router.get('/activation/:link', student.activateStudent)

router.use(isLoggedIn)

router.get('/test', function(req, res){
  res.send('test login')
})

module.exports = router
