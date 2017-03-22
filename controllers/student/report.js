"use strict"

// load lecturers
var student       = require('../../models/student'),
    lecturer      = require('../../models/lecturer'),
    report        = require('../../models/report'),
    funcs         = require('../../middlewares/funcs'),
    util          = require('util'),
    multer        = require('multer')

var baseurl       = require('../../config/baseurl'),
    baseurl       = baseurl.root + 'student'

var root_url    = require('../../config/baseurl'),
      root_url    = root_url.root

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
      let reportName = student.toString()+'-'+reportID+'.pdf'
      report.update({nim:student, "reports.id": reportID}, {"$set": {
        "reports.$.file_location": root_url+'static/reports/'+reportName,
        "reports.$.file_name": reportName,
        "reports.$.last_edit": new Date()
      },
    }, function(err, result){
        if(result){
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
          res.render('student/report/create', {title:"Create report", baseurl, nim, idReport})
        } else if(nReport > 0){
          if(exist.is_approved == true){
            res.render('student/report/create', {title:"Create report", baseurl, nim, idReport})
          } else if(exist.is_approved == false) {
            res.redirect(baseurl+'#')
          }
        } else {
          res.send('PLEASE REVIEW YOUR REPORT')
        }
      } else {
        let supervisor = s.supervisor
        var rep         = new report()
        rep.nim         = nim
        rep.supervisor  = supervisor
        rep.is_create   = false

        rep.save(function(err){
          if(!err){
            res.render('student/report/create', {title:"Create report", baseurl, nim})
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
          "approved":"",
          "file_name":"There is not file, yet!",
          "file_location":"#"
        }
      },
    }, function(err, created){
      if(!err){
        student.findOne({nim:nim}, function(e, std){
          student.update({nim:nim}, {$set: {
            report_status: false
          },}, function(err, report_updated){
            let superv = std.supervisor
            let nMiles = std.milestones.length
            lecturer.findOne({username:superv}, function(e, found){
              let nNotif = found.notifs.length
              lecturer.update({username:superv},{$set:{
                notif_seen: false
              },
                $push:{
                  notifs:{
                    "id":nNotif+1,
                    "notif":nim + " created a report",
                    "date":new Date()
                  }
                },
              }, function(e, notified){
                let id_report = nNotif+1
                if(nMiles >= 3){
                  res.redirect(baseurl+'/report/create/file?from=create')
                } else {
                  student.update({nim:nim},
                  {$push:{
                  milestones:{
                    "id":nMiles+1,
                    "date":new Date(),
                    "category":"report"
                  }
                },}, function(err){ 
                    res.redirect(baseurl+'/report/create/file?from=create')
                    }
                  )
                }
              }
            )
            })
          })
        })
      } else {
        console.log('error creating report')
      }

    }
  )
}

exports.getAddFile = function(req, res){
  console.log('Access this page via : ', req.url)
  res.render('student/report/add-file', {title:"Add file", baseurl})
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
      let showDeleteButton = 'hide'

      // sort by the latest
      reps.sort(function(a,b){
        return parseFloat(b.id) - parseFloat(a.id)
      })
      
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

        // show delete button
        if(reports.is_approved == true && reports.is_create == false && reps.length > 0){
          showDeleteButton = ''
        } else {
          showDeleteButton = 'hide'
        }
        
        res.render('student/report/all', {title:"All reports", baseurl, objReports, colored, statusColored,
          showCreateReport, showEditReport, startReport, approvalStatus, nim, showDeleteButton
        })
      } else {
        startReport = ''
        res.render('student/report/all', {title:"All reports", baseurl, objReports, colored, statusColored,
          showCreateReport, showEditReport, startReport, approvalStatus, nim, showDeleteButton
        })
      }
    } else {
      req.flash('error', 'You must select a supervisor first!')
      res.redirect(baseurl)
    }
  })
}

exports.getSingleReport = function(req, res){
  let idTo  = req.params.id
  let nim   = req.session.student
  report.findOne({nim:nim}, function(err, std){
    let reports = std.reports
    var found = reports.filter(function(item){
      return item.id == idTo
    })
    found = found[0]
    found.last_edit = funcs.friendlyDate(found.last_edit)
    res.render('student/report/report-single', {title:"Report single", baseurl, found, idTo, nim})
  })
}

exports.getUpdateReport = function(req, res){
  let nim = req.session.student
  report.findOne({nim:nim}, function(err, update){
    let reportID = update.reports.length.toString()
    report.findOne({nim:nim}, {"reports":{"$elemMatch":{"id":reportID}}}, function(e, found){
      let reps = found.reports[0]
      res.render('student/report/edit', {title:"Edit latest report", baseurl, nim, reps})
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

exports.removeAll = function(req, res){
  let nim = req.session.student
  report.update({nim:nim},{$set:{
    reports: []
  },}, function(err, removed){
    res.redirect(baseurl+'/reports/all')
  })
}