"use strict"

var express       = require('express'),
    Admin         = require('../../models/admin'),
    Std           = require('../../models/student'),
    Lect          = require('../../models/lecturer'),
    funcs         = require('../../middlewares/funcs'),
    winston       = require('winston'),
    app           = express()

var baseurl       = require('../../config/baseurl'),
    baseurl       = baseurl.root + 'admin'
const roles       = ['super','operator','kaprodi']

exports.getAll = function(req, res){
    let admin = req.session.admin
    let quer  = req.query.type
    let showStd = 'hide', showLecturers = 'hide', showAll = ''
    switch(quer){
        case 'students' : showStd = '', showLecturers = 'hide', showAll = 'hide'
        break;

        case 'lecturers': showLecturers = '', showStd = 'hide', showAll = 'hide'
        break;

        default:
        break;
    }
    // fetch db
    Admin.findOne({role:admin}, function(err, ann){
        let message   = ann.announcements
        let annLength = ann.announcements.length
        let allMsg    = []
        let stdMsg    = []
        let lecMsg    = []
        if(annLength>0){
            // get all
            for(var i=0; i<annLength; i++){
                allMsg.push({
                    id:message[i].id,
                    to:message[i].to,
                    body:message[i].body,
                    date:funcs.friendlyDate(message[i].date),
                    seen_by:message[i].seen_by
                })
                allMsg.sort(function(a,b){
                    return parseFloat(b.id) - parseFloat(a.id)
                })
            }

            // get students
            Admin.aggregate({$match:{"role":admin}},{$unwind:"$announcements"},{$match:{"announcements.to":"students"}},
                function(err, stds){
                    // convert two objects to one array of objects
                    for(var j=0; j<stds.length; j++){
                        stdMsg.push({
                            id:stds[j].announcements.id,
                            to:stds[j].announcements.to,
                            body:stds[j].announcements.body,
                            date:funcs.friendlyDate(stds[j].announcements.date),
                            seen_by:stds[j].announcements.seen_by
                        })
                    }
                    stdMsg.sort(function(a,b){
                        return parseFloat(b.id) - parseFloat(a.id)
                    })
                    

                    // get lecturers
                    Admin.aggregate({$match:{"role":admin}},{$unwind:"$announcements"},{$match:{"announcements.to":"lecturers"}},
                        function(err, lecs){
                            for(var k=0; k<lecs.length; k++){
                                lecMsg.push({
                                    id:lecs[k].announcements.id,
                                    to:lecs[k].announcements.to,
                                    body:lecs[k].announcements.body,
                                    date:funcs.friendlyDate(lecs[k].announcements.date),
                                    seen_by:lecs[k].announcements.seen_by
                                })
                            }
                            lecMsg.sort(function(a,b){
                                return parseFloat(b.id) - parseFloat(a.id)
                            })
                            console.log('lecturer message : ', lecMsg)
                            res.render('admin/announcement/all', {title:"All announcements", baseurl, showStd, showLecturers, showAll, allMsg,
                                stdMsg, lecMsg
                            })
                        }
                    )
                }
            )
        } else {
            console.log('no announcements')
            res.render('admin/announcement/all', {title:"All announcements", baseurl, showStd, showLecturers, showAll, allMsg,
                stdMsg, lecMsg
            })
        }
    })
}

exports.sendNew = function(req, res){
    let admin  = req.session.admin
    let result = req.body.to
    let body   = req.body.msg
    // count announcements
    Admin.findOne({role:admin}, function(err, ann){
        let sumAnns = ann.announcements.length
        switch(result){
        case 'all':
            // add to db
            Admin.update({role:admin}, {$push:{
                "announcements":{
                    "id":sumAnns+1,
                    "to":result,
                    "body":body,
                    "date": new Date(),
                    "seen_by":[]
                }
            },}, function(err){
                if(!err){
                    console.log('announcement send to ', result)
                }
            })
        break;

        case 'students':
            // add to db
            Admin.update({role:admin}, {$push:{
                "announcements":{
                    "id":sumAnns+1,
                    "to":result,
                    "body":body,
                    "date": new Date(),
                    "seen_by":[]
                }
            },}, function(err){
                if(!err){
                    console.log('announcement send to ', result)
                }
            })
        break;

        case 'lecturers':
            // add to db
            Admin.update({role:admin}, {$push:{
                "announcements":{
                    "id":sumAnns+1,
                    "to":result,
                    "body":body,
                    "date": new Date(),
                    "seen_by":[]
                }
            },}, function(err){
                if(!err){
                    console.log('announcement send to ', result)
                }
            })
        break;

        default:
        break;
    }
    req.flash('success', 'Message send to '+result)
    res.redirect(baseurl+'/announcements/all')
    })
}