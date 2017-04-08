'use strict'

var express     = require('express'),
    isOperator  = require('../../middlewares/operator-privilege'),
    opsControl  = require('../../controllers/admin/operator'),
    router      = express.Router()

router.use(isOperator)
router.get('/home', opsControl.getHome)
router.get('/logout', opsControl.postLogout)

module.exports = router
