/*
  REFACTOR :
  1. model distinguish  [-]
  2. async              []
*/

"use strict"

// load lecturers
var student   = require('../../models/student'),
    lecturer  = require('../../models/lecturer'),
    funcs     = require('../../middlewares/funcs'),
    queries   = require('../../models/query.student')

var baseurl       = require('../../config/baseurl'),
    baseurl       = baseurl.root + 'student'

var hiding     = 'hide'
var chooseCode = ''

exports.getNotifs = function(req, res){
  var nim        = req.session.student
  queries.getStudentByNIM(nim, function(err, std){
    let objNotifs = [],
        data      = std.notifs
    
    // sort notifs by latest
    data.sort(function(a,b){
        return parseFloat(b.id) - parseFloat(a.id)
    })
    
    for(var i=0; i<data.length; i++){
      objNotifs.push({
        index:data[i].id,
        notif:data[i].notif,
        date:funcs.friendlyDate(data[i].date)
      })
    }
    // check if notif lengh < 1
    let showDeleteButton = 'hide', showMsg = 'hide'
    if(data.length < 1){
      showDeleteButton = 'hide'
      showMsg = ''
    } else {
      showDeleteButton = ''
      showMsg = 'hide'
    }
    queries.updateSeenNotif(nim, function(e, seen){
        res.render('student/notif/notifs', {title:"All Notifications", objNotifs, nim, showDeleteButton, showMsg, baseurl})
      }
    )
  })
}

exports.getSingleNotif = function(req, res){
  let idToFind   = req.params.id
  var nim        = req.session.student
  queries.getStudentByNIM(nim, function(err, std){
    let notifs = std.notifs
    var found = notifs.filter(function(item){
      return item.id == idToFind
    })
    found = found[0]
    found.date = funcs.friendlyDate(found.date)
    res.render('student/notif/notif-single', {title:"Single notif", found, idToFind, nim, baseurl})
  })
}

exports.removeAllNotifs = function(req, res){
  let nim = req.session.student
  queries.removeAllNotifs(nim, function(err, removed){
    req.flash('success','All notifs removed')
    res.redirect(baseurl+'/notifications')
  })
}

// still won't work
// exports.removeSingleNotif = function(req, res){
//   let id         = req.params.id
//   var nim        = req.session.student
//   console.log(id)
//   student.update({nim:nim},{$pull : {"notifs.id": id
//       },
//     }, function(err, removed){
//       res.send('removed')
//     }
//   )
// }
