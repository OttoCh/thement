var express     = require('express'),
      router    = express.Router(),
      session   = require('../middlewares/loggedin-lecturer')

const baseurl   = 'http://localhost:3500/lecturer'

var lecturer    = require('../controllers/lecturer.module')

router.get('/', lecturer.getIndex)
router.get('/login', lecturer.getLoginPage)
router.get('/logout', lecturer.postLogout)
router.get('/account/forget_pass', lecturer.getForgetPassPage)

router.post('/login', lecturer.postLogin)
router.post('/changepass', lecturer.changeInitPass)

router.use(session)

router.get('/home', lecturer.getHome)
router.get('/candidates', lecturer.getCandidates)
router.get('/candidates/detail/:nim', lecturer.getDetailCandidate)
router.get('/candidates/:nim', lecturer.rejectCandidate)
router.get('/candidates/accept/:nim', lecturer.acceptCandidate)
router.get('/students', lecturer.getFixStudents)
router.get('/student/detail/:nim', lecturer.getDetailStudent)
router.get('/student/detail/:nim/accept', lecturer.acceptStudentReport)

router.use(function(req, res, next){
  res.status(404)
  res.render('static/404', {title:"404 Not Found"})
  return
})
module.exports = router
