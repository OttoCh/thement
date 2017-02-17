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
        index:data[i].id,
        notif:data[i].notif,
        date:friendlyDate(data[i].date)
      })
    }
    res.render('student/notif/notifs', {title:"All Notifications", objNotifs:objNotifs})
  })
}

exports.getSingleNotif = function(req, res){
  let idToFind   = req.params.id
  var nim        = req.session.student
  student.findOne({nim:nim}, function(err, std){
    let notifs = std.notifs
    console.log(notifs)
    // function findNotif(notif){
    //   return notif.id = idToFind
    // }
    // let notifTo = notifs.find(findNotif)
    var found = notifs.filter(function(item){
      return item.id == idToFind
    })
    found = found[0]
    res.render('student/notif/notif-single', {title:"Single notif", found:found, idToFind:idToFind})
  })
}

exports.removeAllNotifs = function(req, res){
  let nim = req.session.student
  student.update({nim:nim},{$set: {
    notifs: []
  },}, function(err, removed){
    console.log('all notifs removed')
    res.redirect(baseurl)
  })
}

exports.removeSingleNotif = function(req, res){
  let id         = req.params.id
  var nim        = req.session.student
  console.log(id)
  student.update({nim:nim},{$pull : {"notifs.id": id
      },
    }, function(err, removed){
      console.log('removed')
      res.send('removed')
    }
  )
}
