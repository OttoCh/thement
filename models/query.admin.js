var Adm = require('./admin'),
    Std = require('./student'),
    Lec = require('./lecturer')

module.exports = {
    
    getAdminByRole: function(role, cb){
        Adm.findOne({role:role},function(err, found){
            if(err) return cb(err)
            cb(null, found)
        })
    }
}