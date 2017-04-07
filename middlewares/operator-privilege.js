var baseurl = require('../config/baseurl'),
    baseurl = baseurl.root + 'admin'
// still hardcode, check role again

module.exports = function(req, res, next){
  if(req.session.admin != 'operator'){
    console.log('unauthorized access to operator!')
    res.redirect(baseurl)
  } else {
    next();
  }
}
