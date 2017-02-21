var Lect        = require('../models/lecturer'),
    Student     = require('../models/student'),
    Std         = require('../models/student.model'),
    funcs       = require('../middlewares/funcs')

const baseurl   = 'http://localhost:3500/lecturer'
var hiding      = ''

exports.getIndex = function(req, res){
  res.redirect('lecturer/login')
}

exports.getLoginPage = function(req, res){
  res.render('lecturer/login', {title:"Lecturer login page", baseurl:baseurl})
}

exports.getForgetPassPage = function(req, res){
  res.render('lecturer/forget-pass', {title:"Forget password", baseurl:baseurl})
}

exports.getHome = function(req, res){
  let lecturer  = req.session.lecturer
  Lect.findOne({username:lecturer}, function(e, found){
    if(found){
      res.render('lecturer/home', {title: "Home", baseurl:baseurl, found:found, hiding:hiding})
    } else {
      console.log('no lecturer found')
    }
  })
}

exports.getCandidates = function(req, res){
  let lecturer = req.session.lecturer
  Lect.findOne({username:lecturer}, function(e, f){
    if(f){
      let cans    = []
      let calons  = f.candidates
      for(var i=0; i<calons.length; i++){
        cans.push({
          index:i,
          nim:calons[i]
        });
      }
      res.render('lecturer/candidates', {title:"All candidates", baseurl:baseurl, cans:cans})
    } else {
      console.log('lecturer not found')
    }
  })
}

exports.getDetailCandidate = function(req, res){
  Std.get(req.params.nim, function(err, student){
    res.render('lecturer/candidate-detail', {title:"Candidate detail", baseurl:baseurl, student:student})
  })
}

exports.rejectCandidate = function(req, res){
  let lecturer = req.session.lecturer
  let nimToRemove = req.params.nim
  Lect.update({username:lecturer}, {$pull : {
        candidates: nimToRemove
      },
    }, function(e, s){
      if(s){
        console.log('success remove student')
        nimToRemove = Number(nimToRemove)
        Student.findOne({nim: nimToRemove}, function(e, found){
          let n = found.notifs.length
          Student.update({nim:nimToRemove}, {$set: {
            supervisor: "",
            is_choose: false,
            is_accepted: false,
            notif_seen: false
              },
              $push : {
                notifs: {
                  "id":n+1,
                  "date": new Date(),
                  "notif": "You are rejected by : " + lecturer,
                  "has_seen": false
                }
              },
            }, function(e, r){
              console.log('success rejecting student')
              res.redirect(baseurl+'/candidates')
            }
          )
        })
      } else {
        console.log('error when removing nim from candidates')
      }
    }
  )
}

exports.acceptCandidate = function(req, res){
  let lecturer    = req.session.lecturer
  let nimToAccept = req.params.nim
  // add nim to 'students' field
  Lect.update({username:lecturer}, {$push : {
        students: nimToAccept
      },
    }, function(err){
      if(!err){
        // remove nim from 'candidates' field
        Lect.update({username:lecturer}, {$pull: {
          candidates: nimToAccept
        },
      }, function(err){
        if(!err){
          // change status is_accepted to true
          nimToAccept = Number(nimToAccept)
          Student.update({nim:nimToAccept}, {$set : {
            is_accepted: true,
            notif_seen:false
          },
        }, function(err){
          if(!err){
            Student.findOne({nim:nimToAccept}, function(e, f){
              let n = f.notifs.length
              Student.findOne({nim:nimToAccept}, function(e, f){
                let n = f.notifs.length
                console.log('current notifs : ', n)
                Student.update({nim:nimToAccept}, {$push : {
                  notifs: {
                    "id":n+1,
                    "date": new Date(),
                    "notif": "You are ACCEPTED by : " + lecturer,
                    "has_seen": false
                  }
                },
              }, function(e, s){
                    console.log('is_accepted is true')
                    res.redirect(baseurl+'/candidates')
                  }
                )
              })
            })
                  }
                }
              )
            }
          }
        )
      }
    }
  )
}

exports.getFixStudents = function(req, res){
  let lecturer = req.session.lecturer
  Lect.findOne({username:lecturer}, function(err, f){
    if(f){
      let stds = []
      let std  = f.students
      for(var i=0; i<std.length; i++){
        stds.push({
          index:i,
          nim:std[i]
        });
      }
      res.render('lecturer/students', {title:"Fix students", baseurl:baseurl, stds:stds})
    }
  })
}

exports.postLogin = function(req, res){

  let user  = req.body.username
  let pass  = req.body.password
  Lect.findOne({username:user}, function(e, found){
    if(found){
      console.log('username : ', user)
      if (found.newpass != null){
        // check newpass
        console.log('newpass exist')
        let decrypted = funcs.decryptTo(found.newpass)
        if(pass !== decrypted){
          console.log('wrong new pass')
          res.send('try again')
        } else {
          console.log('logged in')
          res.send('loggedin')
        }
      } else {
        // check oldpass, redirect to change pass
        console.log('still oldpass')
        if(pass == found.oldpass){
          // logged in, redirect to change pass
          console.log('logged in, change password immediately')

          // save session
          req.session.lecturer = user
          console.log('Logged in as', req.session.lecturer)
          res.redirect('home')
        } else {
          console.log('wrong password')
          res.json({
            status: false,
            message: 'wrong password'
          })
        }
      }
    } else {
      console.log('NOT FOUND')
      res.json({
        status: false,
        message: 'username not found'
      })
    }
  })
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

exports.changeInitPass = function(req, res){
  // get username from session
  let user     = req.body.username,
      oldpass  = req.body.oldpass,
      newp     = req.body.newpass,
   enc_newpass = funcs.encryptTo(newp),
   resetlink   = funcs.maxRandom('as82h323h')

  // check if oldpass true
  Lect.update({username: user}, {$set: {
        newpass: enc_newpass,
        passwordreset_link: resetlink
      },
    }, function(e, success){
      if(success){
        console.log('success')
        res.json({
          status: true,
          message: 'change initial pass success'
        })
      } else {
        console.log('error')
      }
    }
  )
}
