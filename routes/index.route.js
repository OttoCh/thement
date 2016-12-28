var express   = require('express'),
    router    = express.Router()

router.get('/', function(req, res){
  res.json({
    "Status":"OK",
    "Message":"Homepage",
    "Session":req.session.fullname
  })
})

module.exports = router
