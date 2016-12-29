var express   = require('express'),
    router    = express.Router(),
    student   = require('../modules/student.module'),
    auth      = require('../modules/student.auth'),
    loggedin  = require('../middlewares/loggedin')

router.get('/', student.getIndex)
router.post('login', auth.stdLogin)

router.use(loggedin)
router.get('/home', function(req,res){
  res.send('this is home')
})

module.exports = router
