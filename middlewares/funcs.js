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
      let nowDate = now.getDate()
      let tglDate = tgl.getDate()
      let diff    = nowDate - tglDate
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

      var time = tglHours+':'+tglMin+' WIB'
      tgl = month + ' '+ tgl.getDate()+', '+ tgl.getFullYear()+' at '+time

      if(diff > 7){
          tgl = tgl
      }
      else if((diff > 1) && (diff < 7)){
        tgl = diff + ' days ago'
      }
      else if(diff < 1) {
        tgl = 'Today at : '+ time
      }
      else if(diff == 1){
        tgl = 'Yesterday at '+ time
      }
      else {
        tgl = tgl
      }
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
  },

  getLocalIP: function(){
    Object.keys(ifaces).forEach(function (ifname) {
      alias = 0;

      ifaces[ifname].forEach(function (iface) {
        if ('IPv4' !== iface.family || iface.internal !== false) {
          // skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
          return;
        }

        if (alias >= 1) {
          // this single interface has multiple ipv4 addresses
          console.log(ifname + ':' + alias, iface.address);
        } else {
          // this interface has only one ipv4 adress
          console.log('local ip : ' + iface.address);
        }
        ++alias;
      });
    });
    return alias
  }
}
