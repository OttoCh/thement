var express     = require('express'),
      router    = express.Router(),
      session   = require('../middlewares/loggedin-lecturer')

const baseurl   = 'http://localhost:3500/lecturer'

var lecturer    = require('../controllers/lecturer/module'),
    notif       = require('../controllers/lecturer/notif'),
    msg         = require('../controllers/lecturer/message')

router.get('/', lecturer.getIndex)
router.get('/login', lecturer.getLoginPage)
router.get('/logout', lecturer.postLogout)
router.get('/account/forget_pass', lecturer.getForgetPassPage)

router.post('/login', lecturer.postLogin)
router.post('/changepass', lecturer.changeInitPass)

router.use(session)

router.get('/home', lecturer.getHome)
router.get('/profile', lecturer.getProfile)

router.get('/settings', lecturer.getSettings)
router.post('/settings', lecturer.postSettings)

router.get('/candidates', lecturer.getCandidates)
router.get('/candidates/detail/:nim', lecturer.getDetailCandidate)
router.post('/candidates/:nim', lecturer.rejectCandidate)
router.get('/candidates/accept/:nim', lecturer.acceptCandidate)

router.get('/students', lecturer.getFixStudents)
router.get('/student/detail/:nim', lecturer.getDetailStudent)
router.get('/student/detail/:nim/accept', lecturer.acceptStudentReport)
router.get('/student/ta1/accept/:nim', lecturer.getTa1)
router.get('/student/ta2/accept/:nim', lecturer.getTa2)

router.get('/notifications', notif.getNotifs)
router.get('/notifications/delete_all', notif.removeAllNotifs)
router.get('/notification/:id', notif.getSingleNotif)
router.get('/notification/delete/:id', notif.removeSingleNotif)

router.get('/message/initial_broadcast', msg.initBroadcast)
router.get('/message/all?', msg.getAll)
router.get('/message/:nim', msg.getMsgByNIM)
router.post('/message/send', msg.sendMessage)
router.post('/message/send/all', msg.sendToAll)

router.use(function(req, res, next){
  res.status(404)
  res.render('static/404', {title:"404 Not Found"})
  return
})
module.exports = router
