var express   = require('express'),
    router    = express.Router()

var admin     = require('../controllers/admin.module')

router.use(function(req, res, next){
  console.log('%s %s [%s]', req.method, req.url, res.statusCode.toString())
  next()
})

router.get('/', admin.getIndex)

/* LOGGED IN ONLY ACCESS */
// router.use(loggedin)

module.exports = router
