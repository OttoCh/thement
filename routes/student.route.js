var express   = require('express'),
    router    = express.Router(),
    app       = express()
    student   = require('../controllers/student.module'),
    auth      = require('../controllers/student.auth'),
    loggedin  = require('../middlewares/loggedin'),

    Student   = require('../models/student.model')

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
router.get('/account/resetpassword/:link', student.activatePasswordChange)

router.post('/add', student.createStudent)

router.post('/login', auth.stdLogin)
router.post('/register', student.addStudent)
router.post('/account/forget_pass', student.requestPasswordChange)
router.post('/account/resend_activation', student.resendConfirmation)

router.get('/all', student.getAll)
router.get('/:nim', student.getByNIM)

router.use(loggedin)

router.get('/home', student.getHome)
router.get('/profile', student.getProfile)
router.get('/settings', student.getSettings)

router.post('/settings', student.changePassword)
router.post('/profile', student.updateProfile)

module.exports = router
