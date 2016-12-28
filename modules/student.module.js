var express       = require('express'),
    cookieParser  = require('cookie-parser'),
    bodyParser    = require('body-parser'),
    app           = express()

app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())
app.use(cookieParser())

exports.getIndex = function(req, res){
  res.json({
    "Status":"OK",
    "Message":"api/v1/student"
  })
}
