var baseurl = require('../config/baseurl'),
    baseurl = baseurl.root + 'lecturer'
// still hardcode, check role again

module.exports = function(req, res, next){
  if(!req.session.lecturer){
    console.log('[LECTURER] unauthorized access!')
    res.redirect(baseurl)
  } else {
    next();
  }
}
