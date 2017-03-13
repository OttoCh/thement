"use strict"

// load lecturers
var lect      = require('../../models/lecturer.model'),
    student   = require('../../models/student'),
    lecturer  = require('../../models/lecturer')

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
  // pagination
  lecturer.find({},function(err, all){
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
        let profile = found
        
        student.findOne({nim: nim}, function(err, std){
          if(std.is_choose == true){
            hiding = 'hide'
            lect.get(req.params.username, function(err, lecturer){
              res.render('student/lecturer-detail', {title:"Lecturer detail", nim, lecturer, baseurl, hiding, profile, arrLecturers})
            })
          } else {
            let n = std.notifs.length
            
            hiding = ''
            lect.get(req.params.username, function(err, lecturer){
              res.render('student/lecturer-detail', {title:"Lecturer detail", nim, lecturer, baseurl, hiding, profile, arrLecturers})
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
          // add notif to lecturer
          lecturer.findOne({username:lecturerChosen}, function(e, lec){
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
