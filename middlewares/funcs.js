"use strict"

// load all requirements
var key       = '99u9d9h23h9fas9ah832hr',
    encryptor = require('simple-encryptor')(key),
    possible  = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
    os        = require('os'),
    ifaces    = os.networkInterfaces()

var text, strs, alias = 0

module.exports = {
  friendlyDate: function(tgl){
      let now = new Date()
      let nowDate = now.getFullYear()
      let tglDate = tgl.getFullYear()
      let diffY   = nowDate - tglDate
      var month = tgl.getMonth(),
      month = month+1,
      months = ['January', 'February', 'March', 'April', 'May', 'June', 'July','August','September','October','November','Desember'],
      month  = months[tgl.getMonth()]
      var tglMin = tgl.getMinutes()
      if(tglMin < 10){
        tglMin = '0'+tglMin
      } else {
        tglMin = tgl.getMinutes()
      }

      var tglHours = tgl.getHours()
      if(tglHours < 10){
        tglHours = '0'+tglHours
      } else {
        tglHours = tglHours
      }

      let year = ''
      console.log(year + 'and year diff : ' + diffY)
      if(diffY == 0 ){
        year = year
      } else {
        year = nowDate
      }

      var time = tglHours+':'+tglMin+' WIB'
      tgl = month + ' '+ tgl.getDate()+ year +' at '+time

      return tgl
  },

  encryptTo: function(password){
    let encrypted = encryptor.encrypt(password)
    return encrypted
  },

  decryptTo: function(password){
    let decrypted = encryptor.decrypt(password)
    return decrypted
  },

  minRandom: function(){
    text = ''
    for(var i=0; i<10; i++){
      text += possible.charAt(Math.floor(Math.random() * possible.length))
    }
    return (text)
  },

  maxRandom: function(strs){
    text = strs
    for(var i=0; i<20; i++){
      text += possible.charAt(Math.floor(Math.random() * possible.length))
    }
    return (text)
  },

  jsonOutput: function(msg){
    return {
      "status":"Error",
      "Message":msg
    }
  }
  
}
