var express   = require('express'),
    loggedin  = require('../middlewares/loggedin-admin'),
    router    = express.Router()

var admin     = require('../controllers/admin/module'),
    ann       = require('../controllers/admin/announcement')

// access privilege
var isSuper     = require('../middlewares/super-privilege'),
    isOperator  = require('../middlewares/operator-privilege'),
    isKaprodi   = require('../middlewares/kaprodi-privilege')

router.use(function(req, res, next){
  console.log('%s %s [%s]', req.method, req.url, res.statusCode.toString())
  next()
})

router.get('/', admin.getIndex)
router.get('/login', admin.getLoginPage)
router.get('/home', admin.getHome)
router.post('/login', admin.postLogin)
router.get('/logout', admin.postLogout)

/* LOGGED IN ONLY ACCESS */
router.use(loggedin)

router.get('/profile', admin.getProfile)
router.get('/settings', admin.getSettings)

router.get('/students', admin.getStudents)
router.get('/student/:nim', admin.getDetailStudent)
router.get('/student/accept/ta1/:nim', admin.getTa1)
router.get('/student/accept/ta2/:nim', admin.getTa2)

router.get('/lecturers', admin.getLecturers)
router.get('/lecturer/:username', admin.getDetailLecturer)

// operator
router.use(isOperator)
router.get('/announcements/all', ann.getAll)
router.post('/announcement/send', ann.sendNew)

// kaprodi
router.use(isKaprodi)

// super
router.use(isSuper)

router.use(function(req, res, next){
  res.status(404)
  res.render('static/404', {title:"404 Not Found"})
  return
})

module.exports = router
