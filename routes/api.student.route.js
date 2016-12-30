var express   = require('express'),
    router    = express.Router()

var student   = require('../modules/student.module'),
    auth      = require('../modules/student.auth'),
    loggedin  = require('../middlewares/loggedin')

router.get('/', student.getIndex)
router.get('/login', function(req, res){
  res.render('student/login', {title:"Student login"})
})

router.post('/login', auth.stdLogin)
router.get('/logout', auth.stdLogout)

router.post('/register', student.addStudent)
router.post('/resetpassword', student.requestPasswordChange)
router.post('/requestconfirmation', student.resendConfirmation)

router.get('/resetpassword/:link', student.activatePasswordChange)
router.get('/activation/:link', student.activateStudent)

/* LOGGED IN ONLY ACCESS */
router.use(loggedin)

router.put('/changepassword', student.changePassword)
router.post('/changeprofile', student.updateProfile)

module.exports = router
