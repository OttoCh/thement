"use strict"

// load lecturers
var lect      = require('../models/lecturer.model'),
    student   = require('../models/student'),
    lecturer  = require('../models/lecturer'),
    report    = require('../models/report'),
    funcs     = require('../middlewares/funcs'),
    multer    = require('multer')
const baseurl = 'http://localhost:3500/student'
const root_url= 'http://localhost:3500'

var hiding     = 'hide'
var chooseCode = ''

// multer config
var storage = multer.diskStorage({
  destination: function(req, file, cb){
    cb(null, 'public/reports')
  },
  filename: function(req, file, cb, res){
      let student    = req.session.student;
    report.findOne({nim:student}, function(e, found){
      let reportID   = found.reports.length.toString()
      let reportName = student.toString()+'-'+reportID
      console.log('report ID : '+ reportID + ' and name : ' + reportName)
      report.update({nim:student, "reports.id": reportID}, {"$set": {
        "reports.$.file_location": root_url+'/static/reports/'+reportName,
        "reports.$.file_name": reportName,
        "reports.$.last_edit": new Date()
      },
    }, function(err, result){
        if(result){
          console.log('success')
          cb(null, reportName)
        } else {
          console.log('nothing found')
        }
      })
    })
  }
})
var upload  = multer({storage:storage}).single('report')

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
            res.redirect(baseurl+'#')
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
          "last_edit": new Date(),
          "file_name":"There is not file, yet!",
          "file_location":"#"
        }
      },
    }, function(err, created){
      if(!err){
        console.log('report created')
        res.redirect(baseurl+'/report/create/file?from=create')
      } else {
        console.log('error creating report')
      }
    }
  )
}

exports.getAddFile = function(req, res){
  console.log('Access this page via : ', req.url)
  res.render('student/report/add-file', {title:"Add file", baseurl:baseurl})
}

exports.addFile = function(req, res, next){
  upload(req, res, function(err){
    if(err){
      console.log('error when uploading')
      return
    } else {
      if(req.file == null){
        res.json({
          status: false,
          message: "Please provide a file"
        })
      } else {
        let fileType = req.file.originalname.split('.'),
            type     = fileType[1]
        if(type == 'pdf' || type == 'doc' || type == 'docx'){
          res.status(200)
          res.redirect(baseurl+'/home')
          console.log('upload successfull')
        } else {
          res.json({
            status: false,
            message:"File must pdf/doc/docx"
          })
        }
      }
    }
  })
}

exports.getAllReports = function(req, res){
  let nim = req.session.student
  report.findOne({nim:nim}, function(err, reports){
    if(reports){
      let status = reports.is_approved
      let statusColored, colored, showCreateReport = 'hide', showEditReport = 'hide'
      let startReport = 'hide', approvalStatus = 'hide'
      let objReports = []
      let reps = reports.reports
      if(reps.length > 0){
        approvalStatus = ''
        if(status == true){
          colored = 'green'
          statusColored = 'DISETUJUI'
          showCreateReport = ''
        } else {
          colored = 'red'
          statusColored = 'BELUM DISETUJUI',
          showEditReport = ''
        }
        for(var i=0; i<reps.length; i++){
          objReports.push({
            index: reps[i].id,
            title: reps[i].title,
            body: reps[i].body,
            last_edit: funcs.friendlyDate(reps[i].last_edit),
            file_location: reps[i].file_location,
            file_name: reps[i].file_name
          })
        }
        res.render('student/report/all', {title:"All reports", baseurl:baseurl, objReports:objReports, colored:colored, statusColored:statusColored,
          showCreateReport:showCreateReport, showEditReport:showEditReport, startReport:startReport, approvalStatus:approvalStatus, nim:nim
        })
      } else {
        startReport = ''
        res.render('student/report/all', {title:"All reports", baseurl:baseurl, objReports:objReports, colored:colored, statusColored:statusColored,
          showCreateReport:showCreateReport, showEditReport:showEditReport, startReport:startReport, approvalStatus:approvalStatus, nim:nim
        })
      }
    } else {
      res.redirect(baseurl)
    }
  })
}

exports.getSingleReport = function(req, res){
  let id = req.params.id
  res.send('get single report : '+ id)
}

exports.getUpdateReport = function(req, res){
  let nim = req.session.student
  report.findOne({nim:nim}, function(err, update){
    let reportID = update.reports.length.toString()
    report.findOne({nim:nim}, {"reports":{"$elemMatch":{"id":reportID}}}, function(e, found){
      let reps = found.reports[0]
      console.log(reps.body)
      res.render('student/report/edit', {title:"Edit latest report", baseurl:baseurl, nim:nim, reps:reps})
    })
  })
}

exports.updateReport = function(req, res){
  let nim = req.session.student
  report.update({nim:nim, "reports.id":req.body.reportID}, {
    "$set": {
      "reports.$.title":req.body.reportTitle,
      "reports.$.body":req.body.reportBody,
      "reports.$.last_edit": new Date()
      },
    }, function(e, updated){
        res.redirect(baseurl+'/report/create/file?from=update')
    }
  )
}

exports.removeAllReports = function(req, res){
  res.send('remove all reports')
}

exports.removeSingleReport = function(req, res){
  res.send('remove single report')
}
