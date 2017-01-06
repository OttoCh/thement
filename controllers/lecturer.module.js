var Lect        = require('../models/lecturer')
const baseurl   = 'http://localhost:3500/lecturer'

exports.getIndex = function(req, res){
  res.render('lecturer/login', {title:"Lecturer login page"})
}
