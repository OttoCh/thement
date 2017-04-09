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

router.get('/announcements/all', opsControl.getAnnouncements)
router.post('/announcement/send', opsControl.sendNewAnnouncement)

router.get('/student/accept/ta1/:nim', opsControl.verifyTa1)
router.get('/student/accept/ta2/:nim', opsControl.verifyTa2)

module.exports = router
