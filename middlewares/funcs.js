module.exports = {
  friendlyDate: function(tgl){
      let now = new Date()
      let nowDate = now.getDate()
      let tglDate = tgl.getDate()
      let diff    = nowDate - tglDate
      month = tgl.getMonth(),
      month = month+1,
      months = ['January', 'February', 'March', 'April', 'May', 'June', 'July','August','September','October','November','Desember'],
      month  = months[tgl.getMonth()]
      var tglMin = tgl.getMinutes()
      if(tglMin < 10){
        tglMin = '0'+tgl.getMinutes()
      } else {
        tglMin = tgl.getMinutes()
      }

      time = tgl.getHours()+':'+tglMin+' WIB'
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
  }
}
