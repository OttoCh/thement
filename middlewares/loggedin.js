module.exports = function(req, res, next){
  if(!req.session.student){
    console.log('unauthorized access!')
    res.send('unauthorized access! please login first')
  } else {
    next();
  }
}
