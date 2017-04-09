"use strict"

var express       = require('express'),
    funcs         = require('../../middlewares/funcs'),
    adm_query     = require('../../models/query.admin'),
    Std           = require('../../models/student'),
    Lect          = require('../../models/lecturer'),
    app           = express()

var baseurl       = require('../../config/baseurl'),
    root_url      = baseurl.root,
    baseurl       = baseurl.root + 'operator'

exports.getHome = function(req, res){
    let admin = req.session.admin
  if(admin){
    adm_query.getAdminByRole(admin, function(e, a){
      // count all lecturers
          adm_query.countLecturers(function(e, lecturers){
            let nLects = lecturers
            // get all lecturers that have student
            adm_query.countLecturerHasStd(function(err, std){
                let lectHasStd = (std/nLects) * 100
                lectHasStd     = lectHasStd.toFixed(2)
              // count all students
              adm_query.countStudents(function(e, all){
                let nStd = all
                // count student where is_accepted is true
              adm_query.countStudentHasLecturer(function(e, count){
                let nAccepted = count
                let precenAccept = (nAccepted/nStd) * 100
                precenAccept     = precenAccept.toFixed(2)
                res.render('admin/operator/home', {title:"Dashboard", admin, a, nStd, nAccepted, precenAccept, nLects, std, 
                lectHasStd})
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

exports.getStudents = function(req, res){
  let admin = req.session.admin
  adm_query.getAllStudents(function(err, students){
    let allStds = students
    let stds = []
    for(var i=0; i<students.length; i++){
      if(students[i].ta1 != ""){
        let ta1status = students[i].ta1.status
          switch(ta1status){
            case 'waiting':
              stds.push({
                    nim:students[i].nim,
                    fullname:students[i].profile.fullname,
                    nickname:students[i].profile.nickname,
                    ipk:students[i].ipk,
                    last_seen:funcs.friendlyDate(students[i].last_login),
                    email:students[i].email,
                    ta1:'NEW',
                    ta2:'nothing',
                    notifta1:'important',
                    notifta2:'default'
                  })
            break;

            case 'verified':
              if(students[i].ta2 != ""){
                let ta2status = students[i].ta2.status
                switch(ta2status){
                case 'waiting':
                  stds.push({
                    nim:students[i].nim,
                    fullname:students[i].profile.fullname,
                    nickname:students[i].profile.nickname,
                    ipk:students[i].ipk,
                    last_seen:funcs.friendlyDate(students[i].last_login),
                    email:students[i].email,
                    ta1:'VERIFIED',
                    ta2:'NEW',
                    notifta1:'success',
                    notifta2:'important'
                  })
                break;

                case 'verified':
                  stds.push({
                    nim:students[i].nim,
                    fullname:students[i].profile.fullname,
                    nickname:students[i].profile.nickname,
                    ipk:students[i].ipk,
                    last_seen:funcs.friendlyDate(students[i].last_login),
                    email:students[i].email,
                    ta1:'VERIFIED',
                    ta2:'VERIFIED',
                    notifta1:'success',
                    notifta2:'success'
                  })
                break;
              }
              } else {
                stds.push({
                  nim:students[i].nim,
                  fullname:students[i].profile.fullname,
                  nickname:students[i].profile.nickname,
                  ipk:students[i].ipk,
                  last_seen:funcs.friendlyDate(students[i].last_login),
                  email:students[i].email,
                  ta1:'VERIFIED',
                  ta2:'nothing',
                  notifta1:'success',
                  notifta2:'default'
                })
              }
            break;
          }
      } else {
        stds.push({
          nim:students[i].nim,
          fullname:students[i].profile.fullname,
          nickname:students[i].profile.nickname,
          ipk:students[i].ipk,
          last_seen:funcs.friendlyDate(students[i].last_login),
          email:students[i].email,
          ta1:'nothing',
          ta2:'nothing',
          notifta1:'default',
          notifta2:'default'
        })
      } 
    }
    res.render('admin/operator/students', {title:"All students", allStds, stds, admin})
  })
}

exports.getDetailStudent = function(req, res){
  let nim = req.params.nim
  let admin = req.session.admin
  adm_query.getStudentByNIM(nim, function(err, found){
    let ta1Button = 'hide', ta1Message = '', ta2Button = 'hide', ta2Message = ''
    let profile = found
    let ta1 = found.ta1
    let ta2 = found.ta2
    if(ta1 != ""){
      let ta1status = ta1.status
      switch(ta1status){
        case 'waiting':
          ta1Message = 'waiting for verification', ta1Button = ''
        break;

        case 'verified':
          ta1Message = 'verified'
          if(ta2 != ""){
            let ta2status = ta2.status
            switch(ta2status){
              case 'waiting':
                ta2Button = ''
              break;

              case 'verified':
                ta2Message = 'verified'
              break;
            }
          } else {
            ta2Message = 'unknown'
          }
        break;
      }
    } else {  
      ta1Message = 'not yet'
    }
    res.render('admin/operator/student-detail', {title:"Student detail", baseurl, profile, ta1Button, ta1Message, ta2Button, ta2Message})
  })
}

exports.getLecturers = function(req, res){
  adm_query.getAllLecturers(function(err, lect){
    let lects = lect
    res.render('admin/operator/lecturers', {title:"All lecturers", lects})
  })
}

exports.getDetailLecturer = function(req, res){
  let username = req.params.username
  adm_query.getLecturerByUsername(username, function(err, detail){
    let profile = detail
    res.render('admin/operator/lecturer-detail',{title:"Lecturer detail", username, profile, baseurl})    
  })
}