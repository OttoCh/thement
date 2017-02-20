// load lecturers
var lect      = require('../models/lecturer.model'),
    student   = require('../models/student'),
    lecturer  = require('../models/lecturer'),
    report    = require('../models/report'),
    funcs     = require('../middlewares/funcs')
const baseurl = 'http://localhost:3500/student'

var hiding     = 'hide'
var chooseCode = ''

exports.getCreateReport = function(req, res){
  let nim = req.session.student
  student.findOne({nim:nim}, function(e, s){
    // check if initial report has been set
    report.findOne({nim:nim}, function(err, exist){
      if(exist){
        let nReport   = exist.reports.length
        let idReport  = nReport+1
        if(nReport == 0){
          // create report without approval check
          console.log('initial report has been set! n Report : ', nReport)
          res.render('student/report/create', {title:"Create report", baseurl:baseurl, nim:nim, idReport:idReport})
        } else if(nReport > 0){
          if(exist.is_approved == true){
            console.log('initial report has been set! n Report : ', nReport)
            res.render('student/report/create', {title:"Create report", baseurl:baseurl, nim:nim, idReport:idReport})
          } else if(exist.is_approved == false) {
            console.log('latest report has not approved yet')
            res.redirect(baseurl)
          }
        } else {
          console.log('error')
          res.send('PLEASE REVIEW YOUR REPORT')
        }
      } else {
        let supervisor = s.supervisor
        console.log('NIM : ' + nim + ' and Supervisor is ' + supervisor)
        var rep         = new report()
        rep.nim         = nim
        rep.supervisor  = supervisor
        rep.is_create   = false

        rep.save(function(err){
          if(!err){
            console.log('create initial report bio, NIM : ', nim)
            res.render('student/report/create', {title:"Create report", baseurl:baseurl, nim:nim})
          }
        })
      }
    })
  })
}

exports.createReport = function(req, res){
  let nim            = req.session.student
  let reportID       = req.body.reportID
  let reportTitle    = req.body.reportTitle
  let reportBody     = req.body.reportBody
  console.log('CREATED REPORT : ' + 'id : ' + reportID + ' title : '+ reportTitle + ' body : ' + reportBody)

  report.update({nim:nim}, {$set: {
      is_create: true,
      is_approved: false
    },
      $push: {
        reports: {
          "id": reportID,
          "title": reportTitle,
          "body": reportBody,
          "date_created": new Date()
        }
      },
    }, function(err, created){
      if(!err){
        console.log('report created')
        res.redirect('#{baseurl}/home/reports/all')
      } else {
        console.log('error creating report')
      }
    }
  )
}

exports.getAllReports = function(req, res){
  let nim = req.session.student
  res.render('student/report/all', {title:"All reports", baseurl:baseurl})
}

exports.getSingleReport = function(req, res){
  let id = req.params.id
  res.send('get single report : '+ id)
}

exports.updateReport = function(req, res){
  res.send('update single report')
}

exports.removeAllReports = function(req, res){
  res.send('remove all reports')
}

exports.removeSingleReport = function(req, res){
  res.send('remove single report')
}
