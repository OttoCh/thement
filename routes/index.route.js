var express   = require('express'),
    router    = express.Router()

router.get('/', function(req, res){
  res.json({
    "Status":"OK",
    "Message":"Homepage"
  })
})

module.exports = router
