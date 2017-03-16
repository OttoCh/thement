"use strict"

var express   = require('express'),
    funcs     = require('../middlewares/funcs'),
    queries   = require('../models/query.student'),
    std       = require('../models/student'),
    app       = express(),
    baseurl   = require('../config/baseurl'),
    baseurl   = baseurl.root,
    router    = express.Router()

var path = require('path');
var formidable = require('formidable');
var fs = require('fs');
app.use(express.static(path.join(__dirname, 'public')));

router.get('/', function(req, res){
  // flash message
  req.flash('info', 'Welcome')
  res.render('static/home', {title:"Homepage"})
})

router.get('/upload', function(req, res){
  res.render('static/upload')
})

router.get('/test', function(req, res){
  queries.getAllStudents(function(err, students){
    res.json(students)
  })
})

// STATIC ROUTES

router.get('/help', function(req, res){
  res.render('static/apps/help', {title:"Help", baseurl})
})

router.get('/about', function(req, res){
  res.render('static/apps/about', {title:"About", baseurl})
})

router.get('/contact', function(req, res){  
  res.render('static/apps/contact', {title:"Contact", baseurl})
})

router.get('/help/student', function(req,res){
  res.render('static/apps/guide/student/overview', {title:"Guide for Student", baseurl})
})

router.get('/help/student/profile', function(req, res){
  res.render('static/apps/guide/student/profile', {title:"Profile", baseurl})
})

router.get('/help/student/lecturer', function(req, res){
  res.render('static/apps/guide/student/lecturer', {title:"Choosing Lecturer", baseurl})
})

router.post('/upload', function(req,res){
  console.log('filename : ', req.file)
  // create an incoming form object
  var form = new formidable.IncomingForm();

  // specify that we want to allow the user to upload multiple files in a single request
  form.multiples = true;

  // store all uploads in the /uploads directory
  form.uploadDir = path.join(__dirname, '../uploads');

  // every time a file has been uploaded successfully,
  // rename it to it's orignal name
  form.on('file', function(field, file) {
    fs.rename(file.path, path.join(form.uploadDir, file.name));
  });

  // log any errors that occur
  form.on('error', function(err) {
    console.log('An error has occured: \n' + err);
  });

  // once all the files have been uploaded, send a response to the client
  form.on('end', function() {
    res.end('success');
  });

  // parse the incoming request containing the form data
  form.parse(req);
})

module.exports = router
