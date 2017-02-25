"use strict"

// load lecturers
var lect      = require('../models/lecturer.model'),
    student   = require('../models/student'),
    lecturer  = require('../models/lecturer')
const baseurl = 'http://localhost:3500/student'

var hiding     = 'hide'
var chooseCode = ''

exports.getLecturers = function(req, res){
  let nim = req.session.student
  lect.all(function(err, lecturers){
    res.render('student/lecturers', {title:"All lecturers", nim, lecturers, baseurl})
  })
}

exports.getDetailLecturer = function(req, res){
  let nim = req.session.student
  student.findOne({nim: nim}, function(err, std){
    if(std.is_choose == true){
      hiding = 'hide'
      lect.get(req.params.username, function(err, lecturer){
        res.render('student/lecturer-detail', {title:"Lecturer detail", nim, lecturer, baseurl, hiding})
      })
    } else {
      let n = std.notifs.length
      console.log(n)
      hiding = ''
      lect.get(req.params.username, function(err, lecturer){
        res.render('student/lecturer-detail', {title:"Lecturer detail", nim, lecturer, baseurl, hiding})
      })
    }
  })
}

exports.postChooseLecturer = function(req, res){
  let nim = req.session.student
  let chosen = req.url
  // get lecturer's name from url
  let lecturerChosen = chosen.split('/lecturer')[1].split('/')[1]
  student.findOne({nim:nim}, function(err, std){
  let n = std.notifs.length
  student.update({nim: nim}, {$set : {
        is_choose: true,
        is_accepted: false,
        supervisor: lecturerChosen,
        notif_seen:false
      },
      $push: {
        notifs: {
          "id":n+1,
          "date": new Date(),
          "notif": "You are choosing : " + lecturerChosen + "\n Status : PENDING",
          "has_seen": false
        }
      },
    }, function(err, success){
      if(success){
        // update lecturer's document
        lecturer.update({username: lecturerChosen}, {$push : {
            candidates: nim.toString()
        },
      }, function(e, s){
        if(s){
          console.log('success choosing lecturer')
          chooseCode = 'Success choosing lecturer'
          res.redirect(baseurl+'/lecturers')
        } else {
          console.log('error writing to lecturer')
          res.send('error writing to lecturer')
            }
          }
        )
      } else {
        console.log('failed to choose')
        res.send('failed to choose')
      }
    }
  )
  })
}
