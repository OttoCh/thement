var express   = require('express'),
    router    = express.Router()

var student   = require('../modules/student.module'),
    auth      = require('../modules/student.auth'),
    loggedin  = require('../middlewares/loggedin')

router.use(function(req, res, next){
  console.log('%s %s [%s]', req.method, req.url, res.statusCode.toString())
  next()
})

router.get('/', student.getIndex)

router.post('/login', auth.stdLogin)
router.post('/logout', auth.stdLogout)

router.post('/register', student.addStudent)
router.post('/resetpassword', student.requestPasswordChange)
router.post('/requestconfirmation', student.requestConfirmation)

router.get('/resetpassword/:link', student.activatePasswordChange)
router.get('/activation/:link', student.activateStudent)

/* LOGGED IN ONLY ACCESS */
router.use(loggedin)

router.put('/changepassword', student.changePassword)
router.post('/changeprofile', student.updateProfile)

module.exports = router
