var baseurl = require('../config/baseurl'),
    baseurl = baseurl.root + 'student'
// still hardcode, check role again

module.exports = function(req, res, next){
  if(!req.session.student){
    console.log('unauthorized access!')
    res.redirect(baseurl)
  } else {
    next();
  }
}
