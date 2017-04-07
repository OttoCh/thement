var baseurl = require('../config/baseurl'),
    baseurl = baseurl.root + 'admin'
// still hardcode, check role again

module.exports = function(req, res, next){
  if(req.session.admin != 'kaprodi'){
    console.log('unauthorized access to kaprodi!')
    res.redirect(baseurl)
  } else {
    next();
  }
}
