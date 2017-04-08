'use strict'

var express     = require('express'),
    isKaprodi   = require('../../middlewares/kaprodi-privilege'),
    kapControl  = require('../../controllers/admin/kaprodi'),
    router      = express.Router()

router.use(isKaprodi)
router.get('/home', kapControl.getHome)
router.get('/logout', kapControl.postLogout)

module.exports = router