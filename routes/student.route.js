var express   = require('express'),
    router    = express.Router()

var student   = require('../modules/student.module')

router.use(function(req, res, next){
  console.log('%s %s [%s]', req.method, req.url, res.statusCode.toString())
  next()
})

router.get('/', student.getIndex)

router.post('/register', student.addStudent)
router.post('/login', student.stdLogin)
router.post('/logout', student.stdLogout)

router.post('/resetpassword', student.requestPasswordChange)
router.get('/resetpassword/:link', student.activatePasswordChange)
router.get('/activation/:link', student.activateStudent)


// TODO: isLoggedIn still buggy
function isLoggedIn(req,res,next){
    if(!req.session.student){
      console.log('unauthorized access!')
      res.send('unauthorized access! please login first')
    } else {
      next();
    }
  }
//router.use(isLoggedIn)

router.put('/:nim', student.updateProfile)

router.get('/test', function(req, res){
  res.send('test login')
})

module.exports = router
