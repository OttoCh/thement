"use strict"

module.exports = {
    getStudentLevel: function(studyLevel, nimLevel){
    String.prototype.startsWith = function(str){
        return (this.indexOf(str) === 0)
    }
    switch(true){
      case nimLevel.startsWith('102') : studyLevel = 'undegraduate'
      break;

      case nimLevel.startsWith('202') : studyLevel = 'master'
      break;

      case nimLevel.startsWith('302') : studyLevel = 'doctoral'
      break;

      case nimLevel.startsWith('902') : studyLevel = 'teaching master'
      break;

      default: studyLevel ='undetected'
      break;
    }
    studyLevel = studyLevel.toUpperCase()
    return studyLevel
    }
}