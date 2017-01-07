var express     = require('express'),
      router    = express.Router()

const baseurl   = 'http://localhost:3500/lecturer'

var lecturer    = require('../controllers/lecturer.module')

router.get('/', lecturer.getIndex)
router.get('/login', lecturer.getLoginPage)
router.get('/account/forget_pass', lecturer.getForgetPassPage)

router.post('/login', lecturer.postLogin)
router.post('/changepass', lecturer.changeInitPass)

module.exports = router
