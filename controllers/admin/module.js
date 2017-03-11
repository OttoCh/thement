"use strict"

var express       = require('express'),
    Admin         = require('../../models/admin'),
    Std           = require('../../models/student'),
    Lect          = require('../../models/lecturer'),
    funcs         = require('../../middlewares/funcs'),
    winston       = require('winston'),
    app           = express()

var baseurl       = require('../../config/baseurl'),
    baseurl       = baseurl.root + 'admin'
const roles       = ['super','operator','kaprodi']

exports.getIndex = function(req, res){
  res.redirect(baseurl+'/login')
}

exports.getLoginPage = function(req, res){
  let admin = req.session.admin
  if(admin){
    res.redirect('./home')
  } else {
    res.render('admin/login', {title:"Login Admin"})
  }
}

exports.postLogin = function(req, res){
  let pass = req.body.password
  let user = req.body.username
  let message
  console.log('login with user : ' + user + ' and pass : ' + pass)
  winston.log('info', 'Hi in login post')
  Admin.findOne({role:user}, function(err, found){
    if(found){
      switch (user) {
        case 'super': console.log('admin login as', user)

          break;
        case 'kaprodi': console.log('admin login as', user)

          break;
        case 'operator': console.log('admin login as', user)

          break;
        default: console.log('admin not detected')
      }
      // check if initial pass is correct
      let init_pass = found.role + '123'
      console.log('init pass : ', init_pass)
      if(pass == init_pass){
        // correct, redirect to change pass with the secure one
        req.session.admin = user
        console.log('Login as ', req.session.admin)
        res.redirect(baseurl+'/home')
      } else {
        res.status(400).send('wrong password')
      }
      message = 'welcome to Dashboard' + user
    } else {
      console.log('ADMIN NOT DETECTED')
      message = 'NOT AUTHORIZED ACCESS!'
      res.status(400).send('admin not found')
    }
  })
}

exports.getHome = function(req, res){
  let admin = req.session.admin
  if(admin){
    Admin.findOne({role:admin}, function(e, a){
      // count all lecturers
          Lect.count({}, function(e, lecturers){
            let nLects = lecturers

            // get all lecturers that have student
            Lect.count({"students":{$exists: true, $ne: []},},
              function(err, std){
                console.log('total lecturers have std : ', std)
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
                res.render('admin/home', {title:"Dashboard", admin, a, nStd, nAccepted, precenAccept, nLects, std, lectHasStd})
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
        res.format({
          json: function(){
            res.send({
              status:true,
              message: "Logged out"
            })
          },
          html: function(){
            res.redirect('./login')
          }
        })
    }
  });
}

exports.getProfile = function(req, res){
  res.render('admin/profile')
}

exports.getSettings = function(req, res){
  res.render('admin/settings')
}

exports.getStudents = function(req, res){
  let admin = req.session.admin
  let kaprodiShow = 'hide', operatorShow = 'hide', superShow = 'hide'
  switch(admin){
      case 'kaprodi': 
        console.log('role : ', admin)
        kaprodiShow = ''
      break;

      case 'operator': 
        console.log('role : ', admin)
        operatorShow = ''
      break;

      case 'super': 
        console.log('role : ', admin)
        superShow = ''
      break;
    }
  Std.find({}, function(err, students){
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
    res.render('admin/students', {title:"All students", allStds, stds, kaprodiShow, operatorShow, superShow, admin})
  })
}

exports.getDetailStudent = function(req, res){
  let nim = req.params.nim
  let admin = req.session.admin
  let kaprodiShow = 'hide', operatorShow = 'hide', superShow = 'hide'
  switch(admin){
      case 'kaprodi': 
        console.log('role : ', admin)
        kaprodiShow = ''
      break;

      case 'operator': 
        console.log('role : ', admin)
        operatorShow = ''
      break;

      case 'super': 
        console.log('role : ', admin)
        superShow = ''
      break;
    }
  Std.findOne({nim:nim},function(err, found){
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
    res.render('admin/student-detail', {title:"Student detail", baseurl, profile, kaprodiShow, 
    operatorShow, superShow, ta1Button, ta1Message, ta2Button, ta2Message})
  })
}

exports.getLecturers = function(req, res){
  Lect.find({}, function(err, lect){
    let lects = lect
    res.render('admin/lecturers', {title:"All lecturers", lects})
  })
}

exports.getDetailLecturer = function(req, res){
  let username = req.params.username
  Lect.findOne({username:username}, function(err, detail){
    let profile = detail
    res.render('admin/lecturer-detail',{title:"Lecturer detail", username, profile, baseurl})    
  })
}

exports.getTa1 = function(req, res){
  let nim = req.params.nim
  Std.findOne({nim:nim}, function(err, std){
    let superv = std.supervisor
      Std.update({nim:nim},{$set:{
      ta1:{
        "status":"verified",
        "date": new Date(),
        "supervisor":superv
      }
    },}, function(err, ta){
      if(ta){
        console.log('success verify ta1')
      }
      res.redirect(baseurl+'/student/'+nim)
    })
  })
}

exports.getTa2 = function(req, res){
  let nim = req.params.nim
  Std.findOne({nim:nim}, function(err, std){
    let superv = std.supervisor
      Std.update({nim:nim},{$set:{
      ta2:{
        "status":"verified",
        "date": new Date(),
        "supervisor":superv
      }
    },}, function(err, ta){
      if(ta){
        console.log('success verify ta2')
      }
      res.redirect(baseurl+'/student/'+nim)
    })
  })
}