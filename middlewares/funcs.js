module.exports = {
  friendlyDate: function(tgl){
      let now = new Date()

      // check if now is more than 7 days
      let nowDate = now.getDate()
      let tglDate = tgl.getDate()
      let diff    = nowDate - tglDate
      if(diff > 7){
        month = tgl.getMonth(),
        month = month+1,
        months = ['January', 'February', 'March', 'April', 'May', 'June', 'July','August','September','October','November','Desember'],
        month  = months[tgl.getMonth()]
        time = tgl.getHours()+':'+tgl.getMinutes()+' WIB'
        tgl = month + ' '+ tgl.getDate()+', '+ tgl.getFullYear()+' at '+time
      } else if(diff < 1) {
        // check diffhours
        var tglMin = tgl.getMinutes()
        if(tglMin < 10){
          tglMin = '0'+tgl.getMinutes()
        } else {
          tglMin = tgl.getMinutes()
        }
        time = tgl.getHours()+':'+tglMin+' WIB'
        tgl = 'Today at : '+ time
      } else if(diff > 1 && diff < 7){
        console.log('more than a day and less than 7 days')
        tgl = diff + ' days ago'
      } else {
        tgl = 'Not detected'
      }
      return tgl
  }
}
