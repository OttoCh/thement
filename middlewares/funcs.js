module.exports = {
  friendlyDate: function(tgl){
      month = tgl.getMonth(),
      month = month+1,
      months = ['January', 'February', 'March', 'April', 'May', 'June', 'July','August','September','October','November','Desember'],
      month  = months[tgl.getMonth()]
      time = tgl.getHours()+':'+tgl.getMinutes()+' WIB'
      tgl = month + ' '+ tgl.getDate()+', '+ tgl.getFullYear()+' at '+time
      return tgl
  }
}
