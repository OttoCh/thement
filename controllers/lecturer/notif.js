/*
  REFACTOR :
  1. model distinguish  [-]
  2. async              []
*/

"use strict"

// load lecturers
var student     = require('../../models/student'),
    lecturer    = require('../../models/lecturer'),
    funcs       = require('../../middlewares/funcs'),
    lect_query  = require('../../models/query.lecturer'),
    std_query   = require('../../models/query.student')

var baseurl       = require('../../config/baseurl'),
    baseurl       = baseurl.root + 'lecturer'

exports.getNotifs = function(req, res){
  let lect        = req.session.lecturer
  lect_query.getLecturerByUsername(lect, function(err, lec){
    let objNotifs = [],
        data      = lec.notifs
    
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
    lect_query.seenNotif(lect, function(e, seen){
        res.render('lecturer/notif/notifs', {title:"All Notifications", objNotifs, lect, lec, showDeleteButton, showMsg})
    })
  })
}

exports.getSingleNotif = function(req, res){
  let idToFind   = req.params.id
  let lect       = req.session.lecturer
  lect_query.getLecturerByUsername(lect, function(err, lec){
    let notifs = lec.notifs
    var found = notifs.filter(function(item){
      return item.id == idToFind
    })
    found = found[0]
    found.date = funcs.friendlyDate(found.date)
    res.render('lecturer/notif/notif-single', {title:"Single notif", found, idToFind})
  })
}

exports.removeAllNotifs = function(req, res){
  let lect = req.session.lecturer
  lect_query.removeAllNotifs(lect, function(err, removed){
    res.redirect(baseurl+'/notifications')
  })
}