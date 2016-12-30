var express       = require('express'),
    cookieParser  = require('cookie-parser'),
    bodyParser    = require('body-parser'),
    app           = express()

// still hardcode, need to generate
var accessKeys = ['tokenfisikaITB', 'tokenITBfisika', 'ITBfisikatoken', 'ITBtokenfisika',  'fisikatokenITB', 'fisikaITBtoken']
var secretKeys = require('../credentials/secret')

module.exports = function(req, res, next){
  let secretKey = secretKeys.key
  var token   = req.headers['x-access-key']
  let key     = req.headers['x-secret-key']

  if(accessKeys.indexOf(token) > -1 || key == secretKey)
    {
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
