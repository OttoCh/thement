"use strict"

// load lecturers
var lect      = require('../../models/lecturer.model'),
    student   = require('../../models/student'),
    lecturer  = require('../../models/lecturer'),
    report    = require('../../models/report'),
    msg       = require('../../models/message'),
    funcs     = require('../../middlewares/funcs'),
    multer    = require('multer')
const baseurl = 'http://localhost:3500/lecturer'
const root_url= 'http://localhost:3500'

exports.getAll = function(req, res){
    let lec = req.session.lecturer
    lecturer.findOne({username:lec}, function(err, found){
        if(found){
            let stds = found.students
            let objStd = []
            // for(var i=0; i<stds.length; i++){
            //     objStd.push({
            //         index:i,
            //         nim:stds[i]
            //     })
            // }
            res.render('lecturer/message/all', {title:"All messages", stds})
        }
    })
}

exports.getMsgByNIM = function(req, res){
    let lec = req.session.lecturer
    let nim = req.params.nim
    res.render('lecturer/message/bynim', {title:"Message by NIM"})
}