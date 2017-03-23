/*
  REFACTOR :
  1. model distinguish  [-]
  2. async              [-]
*/

"use strict"

// load lecturers
var lect      = require('../../models/query.lecturer'),
    student   = require('../../models/student'),
    lecturer  = require('../../models/lecturer'),
    queries   = require('../../models/query.student'),
    async     = require('async')

var baseurl       = require('../../config/baseurl'),
    baseurl       = baseurl.root + 'student'

var hiding     = 'hide'
var chooseCode = ''

exports.getLecturers = function(req, res){
  let nim = req.session.student
  lect.all(function(err, lecturers){
    res.render('student/lecturers', {title:"All lecturers", nim, lecturers, baseurl})
  })
}

exports.getDetailLecturer = function(req, res){
  let nim   = req.session.student
  let param = req.params.username
  
  let nimLevel  = nim.toString()
  let stdWeight
  let studyLevel
    String.prototype.startsWith = function(str){
      return (this.indexOf(str) === 0)
    }
    switch(true){
      case nimLevel.startsWith('102') : studyLevel = 'undegraduate', stdWeight = 1
      break;

      case nimLevel.startsWith('202') : studyLevel = 'master', stdWeight = 2
      break;

      case nimLevel.startsWith('302') : studyLevel = 'doctoral', stdWeight = 3
      break;

      case nimLevel.startsWith('902') : studyLevel = 'teaching master', stdWeight = 2
      break;

      default: studyLevel ='undetected'
      break;
    }

  // pagination
  lect.all(function(err, all){
    let allLecturers = all
    let currentLecturer = param
    // console.log('array of lecturers username : ', all)
    let arrLecturers = []
    for(var i=0; i<all.length; i++){
      arrLecturers.push({
        id:i+1,
        name:allLecturers[i].name,
        username:allLecturers[i].username
      })
    }

    
    lect.getLecturerByUsername(param, function(err, found){
      if(found){
        let init_we   = found.std_weight
        let final_we  = init_we + stdWeight
        let profile   = found
        let weight    = found.std_weight
        let over      = 'hide', available = 'hide'
        
        queries.getStudentByNIM(nim, function(err, std){
          if(std.is_choose == true || weight == 12 || final_we > 12){
            hiding = 'hide'
            // if(weight == 12){
            //   over = ''
            // } else {
              
            // }

            if (final_we >= 12){
              available = ''
            } else {

            }
            lect.getLecturerByUsername(req.params.username, function(err, lecturer){
              res.render('student/lecturer-detail', {title:"Lecturer detail", nim, lecturer, baseurl, hiding, profile, arrLecturers, over, available})
            })
          } else {
            let n = std.notifs.length
            
            hiding = ''
            lect.getLecturerByUsername(req.params.username, function(err, lecturer){
              res.render('student/lecturer-detail', {title:"Lecturer detail", nim, lecturer, baseurl, hiding, profile, arrLecturers, over, available})
            })
          }
        })
      } else{
        console.log('not found')
        res.redirect(baseurl)
      }
    })
  })
}

exports.postChooseLecturer = function(req, res){
  let nim = req.session.student
  let chosen = req.url
  let candidate = nim.toString()
  let lecturerChosen = chosen.split('/lecturer')[1].split('/')[1]
  let username = lecturerChosen
  let notifLength, msg, nLength, msgLec

  async.waterfall([
    function(callback){
      queries.getStudentByNIM(nim, function(err, std){
        msg = 'You are choosing ' + lecturerChosen + ' STATUS : PENDING'
        notifLength = std.notifs.length+1
        callback(std[0])
      })
    },
    function(callback){
      queries.addNotif(nim, msg, notifLength, function(err){
        callback(null)
      })
    },
    function(callback){
      queries.chooseLecturer(nim, lecturerChosen, function(err){
        callback(null)
      })
    },
    function(callback){
      lect.getLecturerByUsername(username, function(err, lec){
        nLength = lec.notifs.length
        msgLec = 'You are chosen by '+ nim
        callback(lec[0])
      })
    },
    function(callback){
      lect.updateLecturerCandidates(username, candidate, function(err){
        callback(null)
      })
    },
    function(callback){
      lect.addNotif(username, nLength, msgLec, function(err){
        callback(null)
      })
    }
  ], function(err, results){
    if(!err) res.redirect(baseurl+'/lecturers')
  })
}