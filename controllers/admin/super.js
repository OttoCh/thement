"use strict"

var express       = require('express'),
    funcs         = require('../../middlewares/funcs'),
    adm_query     = require('../../models/query.admin'),
    app           = express()

var baseurl       = require('../../config/baseurl'),
    baseurl       = baseurl.root + 'admin'

exports.getProfile = function(req, res){
    res.render('admin/super/profile',{title:"Super Profile", baseurl})
}