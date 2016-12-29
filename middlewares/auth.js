var express       = require('express'),
    cookieParser  = require('cookie-parser'),
    bodyParser    = require('body-parser'),
    app           = express()

// still hardcode, need to generate
var tokenValids = ['tokenfisikaITB', 'ITBfisikatoken', 'fisikaITBtoken']

module.exports = function(req, res, next){
  var token   = req.headers['x-access-key']
  if (token == tokenValids[0] || token == tokenValids[1] || token == tokenValids[2]) {
    try {
      next()
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
