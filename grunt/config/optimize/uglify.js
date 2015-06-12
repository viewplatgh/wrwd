// Configuration for Uglify task(s)
// Minifies JavaScript files
'use strict';

var taskConfig = function(grunt) {

  grunt.config.set('uglify', {
    dist: {
      options: {
        mangle: true,
        preserveComments: 'some',
        sourceMap: true,
        sourceMapIncludeSources: true
      },
      expand: true,
      cwd: '<%= yeogurt.dist %>/client/bower_components/',
      dest: '<%= yeogurt.dist %>/client/bower_components/',
      src: [
        'requirejs/require.js'
      ],
      ext: '.js'
    }
  });

};

module.exports = taskConfig;
