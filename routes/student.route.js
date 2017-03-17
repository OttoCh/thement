var express   = require('express'),
    router    = express.Router(),
    app       = express()
    student   = require('../controllers/student/module'),
    choose    = require('../controllers/student/choose'),
    notif     = require('../controllers/student/notif'),
    report    = require('../controllers/student/report'),
    msg       = require('../controllers/student/message'),
    auth      = require('../controllers/student/auth'),
    loggedin  = require('../middlewares/loggedin')

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

router.use(loggedin)

router.get('/home', student.getHome)
router.get('/profile', student.getProfile)
router.get('/profile/success', student.getProfileSuccess)

router.get('/notifications', notif.getNotifs)
router.get('/notifications/delete_all', notif.removeAllNotifs)
router.get('/notification/:id', notif.getSingleNotif)
router.get('/notification/delete/:id', notif.removeSingleNotif)

router.get('/settings', student.getSettings)
router.get('/lecturers', choose.getLecturers)
router.get('/lecturer/:username', choose.getDetailLecturer)

router.post('/settings', student.changePassword)
router.post('/profile/update', student.updateProfile)
router.post('/profile', student.imgUpload)
router.post('/lecturer/:username/choose', choose.postChooseLecturer)

// report
router.get('/report/create', report.getCreateReport)

router.get('/report/create/file', report.getAddFile)
router.get('/report/update', report.getUpdateReport)
router.get('/reports/all', report.getAllReports)
router.get('/report/:id', report.getSingleReport)
router.get('/report/delete/all', report.removeAll)

router.post('/report/create/file', report.addFile)
router.post('/report/create', report.createReport)
router.post('/report/update', report.updateReport)

// message
router.get('/message/all?', msg.getAll)
router.get('/message/all/delete', msg.removeAll)
router.get('/message/broadcast/:id', msg.getDetailBroadcast)

router.post('/message/send', msg.sendMessage)

// announcement
router.get('/announcements', msg.getAnnouncements)
router.get('/announcement/detail/:id', msg.getDetailAnnouncement)

router.use(function(req, res, next){
  res.status(404)
  res.render('static/404', {title:"404 Not Found"})
  return
})

module.exports = router
