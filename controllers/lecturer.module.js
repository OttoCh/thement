var Lect        = require('../models/lecturer'),
    Student     = require('../models/student'),
    Std         = require('../models/student.model'),
    key         = 'hjshdjshd2283yausa2t323t7',
    possible    = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
    encryptor   = require('simple-encryptor')(key)

const baseurl   = 'http://localhost:3500/lecturer'

var hiding      = ''

/* functions */
// 1. hash password
hash = function(password){
  let encrypted = encryptor.encrypt(password)
  return encrypted
}

dehash = function(password){
  let decrypted = encryptor.decrypt(password)
  return decrypted
}

// 2. generate random code
var text, strs
randoms = function(strs){
  text = strs
  for(var i=0; i<20; i++){
    text += possible.charAt(Math.floor(Math.random() * possible.length))
  }
  return (text)
}

random = function(){
  text = ''
  for(var i=0; i<10; i++){
    text += possible.charAt(Math.floor(Math.random() * possible.length))
  }
  return (text)
}

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
        Student.update({nim:nimToRemove}, {$set: {
          supervisor: "",
          is_choose: false
        },
      }, function(e, r){
        if(r){
          console.log('success!')
          res.redirect(baseurl+'/candidates')
        } else {
          console.log('error changing student status')
        }
      }
    )
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
            is_accepted: true
          },
        }, function(err){
          if(!err){
            console.log('is_accepted is true')
            res.redirect(baseurl+'/candidates')
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
        let decrypted = dehash(found.newpass)
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
   enc_newpass = hash(newp),
  lresetlink   = randoms('as82h323h')

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
