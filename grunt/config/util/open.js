// Configuration for Open task(s)
// Opens up default browser to specified URL
'use strict';

var taskConfig = function(grunt) {

  grunt.config.set('open', {
    server: {
      url: 'http://0.0.0.0:8080/'
    }
  });

};

module.exports = taskConfig;
