var express   = require('express'),
    router    = express.Router(),
    app       = express()
    student   = require('../controllers/student.module'),
    choose    = require('../controllers/student.choose'),
    auth      = require('../controllers/student.auth'),
    loggedin  = require('../middlewares/loggedin'),

    Student   = require('../models/student.model')

const baseurl     = 'http://localhost:3500/student'

// TODO: Use headers in every request

router.get('/', student.getIndex)
router.get('/register', student.getRegisterPage)
router.get('/login', student.getLoginPage)
router.get('/logout', auth.stdLogout)
router.get('/register/success', student.getRegisterSuccess)
router.get('/account/resend_activation', student.getResendActivation)
router.get('/account/resend_activation/sent', student.getResendSuccess)
router.get('/account/activation/:link', student.activateStudent)
router.get('/account/forget_pass', student.getForgetPassPage)
router.get('/account/forget_pass/sent', student.getPassResetSuccess)
router.get('/account/resetpassword/:link', student.activateResetPass)

router.post('/login', auth.stdLogin)
router.post('/register', student.addStudent)
router.post('/account/forget_pass', student.requestPasswordChange)
router.post('/account/resend_activation', student.resendConfirmation)

router.get('/all', student.getAll)
// router.get('/:nim', student.getByNIM)

router.use(loggedin)

router.get('/home', student.getHome)
router.get('/profile', student.getProfile)
router.get('/profile/imgupload', function(req, res){
  res.redirect(baseurl+'/profile')
})

router.get('/settings', student.getSettings)
router.get('/lecturers', choose.getLecturers)
router.get('/lecturer/:username', choose.getDetailLecturer)

router.post('/settings', student.changePassword)
router.post('/profile', student.updateProfile)
router.post('/profile/imgupload', student.imgUpload)
router.post('/lecturer/:username/choose', choose.postChooseLecturer)
module.exports = router
