var express   = require('express'),
    router    = express.Router(),
    app       = express()
    student   = require('../modules/student.module'),
    auth      = require('../modules/student.auth'),
    loggedin  = require('../middlewares/loggedin')

// TODO: Use headers in every request

router.get('/', student.getIndex)
router.get('/login', student.getLoginPage)
router.post('/login', auth.stdLogin)
router.get('/logout', auth.stdLogout)

router.use(loggedin)
router.get('/home', student.getHome)
router.get('/profile', student.getProfile)

module.exports = router
