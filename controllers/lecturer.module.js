var Lect        = require('../models/lecturer'),
    key         = 'hjshdjshd2283yausa2t323t7',
    possible    = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
    encryptor   = require('simple-encryptor')(key)

const baseurl   = 'http://localhost:3500/lecturer'

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
  res.render('lecturer/home', {title: "Home", baseurl:baseurl})
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
