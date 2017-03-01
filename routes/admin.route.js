var express   = require('express'),
    router    = express.Router()

var admin     = require('../controllers/admin/module')

router.use(function(req, res, next){
  console.log('%s %s [%s]', req.method, req.url, res.statusCode.toString())
  next()
})

router.get('/', admin.getIndex)
router.get('/login', admin.getLoginPage)
router.get('/home', admin.getHome)
router.post('/login', admin.postLogin)
router.get('/logout', admin.postLogout)

/* LOGGED IN ONLY ACCESS */
// router.use(loggedin)

router.use(function(req, res, next){
  res.status(404)
  res.render('static/404', {title:"404 Not Found"})
  return
})

module.exports = router
