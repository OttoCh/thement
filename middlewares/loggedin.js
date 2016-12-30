var baseurl = 'http://localhost:3500/student'
// still hardcode, check role again

module.exports = function(req, res, next){
  if(!req.session.student){
    console.log('unauthorized access!')
    res.redirect(baseurl)
  } else {
    next();
  }
}
