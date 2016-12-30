var express   = require('express'),
    router    = express.Router(),
    student   = require('../modules/student.module'),
    auth      = require('../modules/student.auth'),
    loggedin  = require('../middlewares/loggedin')

router.get('/', student.getIndex)
router.post('/login', auth.stdLogin)
router.get('/logout', auth.stdLogout)

router.use(loggedin)

router.get('/home', student.getHome)

module.exports = router
