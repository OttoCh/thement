var express     = require('express'),
      router    = express.Router()

const baseurl   = 'http://localhost:3500/lecturer'

var lecturer    = require('../controllers/lecturer.module')

router.get('/', lecturer.getIndex)

module.exports = router
