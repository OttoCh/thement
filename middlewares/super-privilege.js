var baseurl = require('../config/baseurl'),
    baseurl = baseurl.root + 'admin'
// still hardcode, check role again

module.exports = function(req, res, next){
  if(req.session.admin != 'super'){
    console.log('unauthorized access to super!')
    res.redirect(baseurl)
  } else {
    next();
  }
}
