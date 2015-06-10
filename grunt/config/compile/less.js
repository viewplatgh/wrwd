// Configuration for LESS task(s)
// Compile LESS stylesheets to single `.css` file
'use strict';

var taskConfig = function(grunt) {

  grunt.config.set('less', {
    server: {
      options: {
        paths: [
          '<%= yeogurt.client %>/bower_components',
          '<%= yeogurt.client %>/styles'
        ],
        sourceMap: true,
        sourceMapFilename: '<%= yeogurt.tmp %>/styles/main.css.map',
        sourceMapBasepath: '<%= yeogurt.tmp %>/styles/',
        sourceMapRootpath: '',
        dumpLineNumbers: 'comments',
        outputSourceFiles: true
      },
      expand: true,
      cwd: '<%= yeogurt.client %>/',
      dest: '<%= yeogurt.tmp %>/',
      src: [
        'styles/main.less'
      ],
      ext: '.css'
    },
    dist: {
      options: {
        paths: [
          '<%= yeogurt.client %>/bower_components',
          '<%= yeogurt.client %>/styles'
        ],
        sourceMap: true,
        sourceMapFilename: '<%= yeogurt.dist %>/client/styles/main.css.map',
        sourceMapBasepath: '<%= yeogurt.dist %>/client/styles/',
        sourceMapRootpath: './',
        compress: true,
        outputSourceFiles: true
      },
      expand: true,
      cwd: '<%= yeogurt.client %>/',
      dest: '<%= yeogurt.dist %>/client/',
      src: [
        'styles/main.less'
      ],
      ext: '.css'
    }
  });

};

module.exports = taskConfig;
