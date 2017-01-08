var baseurl = 'http://localhost:3500/lecturer'
// still hardcode, check role again

module.exports = function(req, res, next){
  if(!req.session.lecturer){
    console.log('unauthorized access!')
    res.redirect(baseurl)
  } else {
    next();
  }
}
