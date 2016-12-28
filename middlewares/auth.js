var express       = require('express'),
    cookieParser  = require('cookie-parser'),
    bodyParser    = require('body-parser'),
    app           = express()

// still hardcode, need to generate
var tokenValid = 'tokenFisikaITB'
var text, str
function makeid(str){
	text = str;
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for(var i=0; i<10; i++){
  	text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return console.log(text);
}

module.exports = function(req, res, next){
  var token   = req.headers['x-access-key']
  if (token == tokenValid) {
    try {
      next()
      makeid('fisikaITB')
    } catch (err) {
      res.status(500);
      res.json({
        "status": 500,
        "message": "Oops something went wrong",
        "error": err
      });
    }
  } else {
    res.status(401);
    res.json({
      "status": 401,
      "message": "Invalid Token or Key"
    });
    return;
  }
}
