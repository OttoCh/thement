var express   = require('express'),
    router    = express.Router(),
    app       = express()
    student   = require('../modules/student.module'),
    auth      = require('../modules/student.auth'),
    loggedin  = require('../middlewares/loggedin')

// TODO: Use headers in every request

router.get('/', student.getIndex)
router.get('/register', student.getRegisterPage)
router.get('/login', student.getLoginPage)
router.get('/logout', auth.stdLogout)
router.get('/register/success', student.getRegisterSuccess)
router.get('/account/activation/:link', student.activateStudent)

router.post('/login', auth.stdLogin)
router.post('/register', student.addStudent)

router.use(loggedin)
router.get('/home', student.getHome)
router.get('/profile', student.getProfile)

module.exports = router
