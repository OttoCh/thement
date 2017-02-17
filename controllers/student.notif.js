// load lecturers
var lect      = require('../models/lecturer.model'),
    student   = require('../models/student'),
    lecturer  = require('../models/lecturer')
const baseurl = 'http://localhost:3500/student'

var hiding     = 'hide'
var chooseCode = ''
friendlyDate = function(tgl){
    month = tgl.getMonth(),
    month = month+1,
    months = ['January', 'February', 'March', 'April', 'May', 'June', 'July','August','September','October','November','Desember'],
    month  = months[tgl.getMonth()]
    time = tgl.getHours()+':'+tgl.getMinutes()+' WIB'
    tgl = month + ' '+ tgl.getDate()+', '+ tgl.getFullYear()+' at '+time
    return tgl
}

exports.getNotifs = function(req, res){
  var nim        = req.session.student
  student.findOne({nim:nim}, function(err, std){
    let objNotifs = [],
        data      = std.notifs
    for(var i=0; i<data.length; i++){
      objNotifs.push({
        index:i,
        notif:data[i].notif,
        date:friendlyDate(data[i].date)
      })
    }
    var notifs = objNotifs.reverse()
    console.log(notifs)
    res.render('student/notif/notifs', {title:"All Notifications", notifs:notifs})
  })
}

exports.getSingleNotif = function(req, res){
  var nim        = req.session.student
  student.findOne({nim:nim}, function(err, std){
    let objNotifs = [],
        data      = std.notifs
    for(var i=0; i<data.length; i++){
      objNotifs.push({
        index:i,
        notif:data[i].notif,
        date:friendlyDate(data[i].date)
      })
    }
    res.render('student/notif/notif-single', {title:"Single notif"})
  })
}

exports.removeAllNotifs = function(req, res){
  res.send('remove all notifs')
}

exports.removeSingleNotif = function(req, res){
  res.send('remove single notif')
}
