"use strict"

var express       = require('express'),
    funcs         = require('../../middlewares/funcs'),
    adm_query     = require('../../models/query.admin'),
    Std           = require('../../models/student'),
    Lect          = require('../../models/lecturer'),
    app           = express()

var baseurl       = require('../../config/baseurl'),
    baseurl       = baseurl.root + 'super'

exports.getHome = function(req, res){
    let admin = req.session.admin
  if(admin){
    adm_query.getAdminByRole(admin, function(e, a){

      // count all lecturers
          Lect.count({}, function(e, lecturers){
            let nLects = lecturers

            // get all lecturers that have student
            Lect.count({"students":{$exists: true, $ne: []},},
              function(err, std){
                
                // count all lecturers that has std
                let lectHasStd = (std/nLects) * 100
                lectHasStd     = lectHasStd.toFixed(2)

              // count all students
              Std.count({}, function(e, all){
                let nStd = all
                // count student where is_accepted is true
              Std.count({"is_accepted":true}, function(e, count){
                let nAccepted = count
                let precenAccept = (nAccepted/nStd) * 100
                precenAccept     = precenAccept.toFixed(2)
                res.render('admin/super/home', {title:"Dashboard", admin, a, nStd, nAccepted, precenAccept, nLects, std, 
                lectHasStd, baseurl})
              })
            })
          })
        })
      })
  } else {
    console.log('UNAUTHORIZED ACCESS!')
    res.redirect('./login')
  }
}

exports.postLogout = function(req, res){
  req.session.destroy(function(err){
    if(err){
        console.log(err);
    } else {
        res.redirect(baseurl)
    }
  });
}

exports.getLecturers = function(req, res){
  adm_query.getAllLecturers(function(err, lect){
    let lects = lect
    res.render('admin/super/lecturers', {title:"All lecturers", lects, baseurl})
  })
}

exports.getStudents = function(req, res){
  adm_query.getAllStudents(function(err, std){
    let stds = std
    res.render('admin/super/students', {title:"All students", stds, baseurl})
  })
}

exports.getProfile = function(req,res){
  res.render('admin/super/profile', {title:"Profile", baseurl})
}