var baseurl = 'http://localhost:3500/admin'
// still hardcode, check role again

module.exports = function(req, res, next){
  if(!req.session.admin){
    console.log('unauthorized access!')
    res.redirect(baseurl)
  } else {
    next();
  }
}
