'use strict'

var express     = require('express'),
    isOperator  = require('../../middlewares/operator-privilege'),
    opsControl  = require('../../controllers/admin/operator'),
    router      = express.Router()

router.use(isOperator)
router.get('/home', opsControl.getHome)
router.get('/logout', opsControl.postLogout)

router.get('/students', opsControl.getStudents)
router.get('/student/:nim', opsControl.getDetailStudent)

router.get('/lecturers', opsControl.getLecturers)
router.get('/lecturer/:username', opsControl.getDetailLecturer)

module.exports = router
