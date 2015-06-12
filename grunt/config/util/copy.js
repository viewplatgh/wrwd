// Configuration for Copy task(s)
// Copies specified folders/files to specified destination
'use strict';

var taskConfig = function(grunt) {

  grunt.config.set('copy', {
    server: {
      files: [{
         expand: true,
          cwd: '<%= yeogurt.client %>/',
          dest: '<%= yeogurt.tmp %>',
          src: [
            'styles/styleguide.md'
          ]
        }]
    },
    dist: {
      files: [{
        expand: true,
        cwd: '<%= yeogurt.client %>/',
        dest: '<%= yeogurt.dist %>/client/',
        src: [
          'bower_components/requirejs/require.js',
          'styles/styleguide.md',
          'docs/styleguide/public/images',
          'styles/fonts/**/*.{woff,otf,ttf,eot,svg}',
          'images/**/*.{webp}',
          '!*.js',
          '*.{ico,png,txt}',
          '*.html'
        ]
      }, {
        expand: true,
        cwd: '<%= yeogurt.server %>/templates/',
        dest: '<%= yeogurt.tmp %>',
        src: [
          'index.html'
        ]
      }, {
        expand: true,
        cwd: './',
        dest: '<%= yeogurt.dist %>/',
        src: [
          '<%= yeogurt.server %>/**/*',
          'server.js',
          'package.json'
        ]
      }, {
        expand: true,
        cwd: '<%= yeogurt.client %>/bower_components/font-awesome-css/fonts/',
        dest: '<%= yeogurt.dist %>/client/styles/fonts/',
        src: [
          '*.{woff,otf,ttf,eot,svg}'
        ],
      }]
    }
  });

};

module.exports = taskConfig;
