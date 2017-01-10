// load lecturers
var lect      = require('../models/lecturer.model'),
    student   = require('../models/student'),
    lecturer  = require('../models/lecturer')
const baseurl = 'http://localhost:3500/student'

exports.getLecturers = function(req, res){
  let nim = req.session.student
  lect.all(function(err, lecturers){
    res.render('student/lecturers', {title:"All lecturers", nim:nim, lecturers:lecturers, baseurl:baseurl})
  })
}

exports.getDetailLecturer = function(req, res){
  let nim = req.session.student
  console.log(req.url)
  lect.get(req.params.username, function(err, lecturer){
    res.render('student/lecturer-detail', {title:"Lecturer detail", nim:nim, lecturer:lecturer, baseurl:baseurl})
  })
}

exports.postChooseLecturer = function(req, res){
  let nim = req.session.student
  let chosen = req.url
  // get lecturer's name from url
  let lecturerChosen = chosen.split('/lecturer')[1].split('/')[1]
  student.update({nim: nim}, {$set : {
        is_choose: true,
        is_accepted: false,
        supervisor: lecturerChosen
      },
    }, function(err, success){
      if(success){
        // update lecturer's document
        lecturer.update({username: lecturerChosen}, {$push : {
            candidates: nim
        },
      }, function(e, s){
        if(s){
          console.log('success choosing lecturer')
          res.json({
            status: true,
            message: "Success choosing lecturer"
          })
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
}
