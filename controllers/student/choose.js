"use strict"

// load lecturers
var lect      = require('../../models/query.lecturer'),
    student   = require('../../models/student'),
    lecturer  = require('../../models/lecturer'),
    queries   = require('../../models/query.student')

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

    
    lecturer.findOne({username:param},function(err, found){
      if(found){
        let init_we   = found.std_weight
        let final_we  = init_we + stdWeight
        let profile   = found
        let weight    = found.std_weight
        let over      = 'hide', available = 'hide'
        
        student.findOne({nim: nim}, function(err, std){
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
  // get lecturer's name from url
  let lecturerChosen = chosen.split('/lecturer')[1].split('/')[1]
  queries.getStudentByNIM(nim, function(err, std){
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
          
          // add notif to lecturer
          lect.getLecturerByUsername(lecturerChosen, function(e, lec){
            let nLength = lec.notifs.length
            lecturer.update({username:lecturerChosen},{$set:{
              notif_seen:false
            },
              $push:{
                notifs:{
                  "id":nLength+1,
                  "notif":"You are chosen by "+nim ,
                  "date":new Date()
                }
              },
            }, function(e, cb){
                  chooseCode = 'Success choosing lecturer'
                  res.redirect(baseurl+'/lecturers')
              }
            )
            })
          } else {
            res.send('error writing to lecturer')
              }
            }
          )
        } else {
          res.send('failed to choose')
        }
      }
    )
  })
}
