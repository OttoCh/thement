'use strict'

var express     = require('express'),
    isSuper     = require('../../middlewares/super-privilege'),
    superControl= require('../../controllers/admin/super'),
    router      = express.Router()


router.use(isSuper)
router.get('/home', superControl.getHome)
router.get('/logout', superControl.postLogout)
router.get('/profile', superControl.getProfile)

router.get('/students', superControl.getStudents)

router.get('/lecturers', superControl.getLecturers)

module.exports = router
