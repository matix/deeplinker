/*global module:false*/
module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    // Metadata.
    pkg: grunt.file.readJSON('package.json'),
    banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
      '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
      '<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' +
      '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
      ' Licensed <%= pkg.license %> */\n',
    // Task configuration.
    concat: {
      options: {
        banner: '<%= banner %>',
        stripBanners: true
      },
      dist: {
        src: [
          'extra/prefix.js',
          'lib/utils.js',
          'lib/*.js',
          'lib/exports.js',
          'extra/suffix.js'
        ],
        dest: 'dist/<%= pkg.name %>.js'
      }
    },
    uglify: {
      options: {
        banner: '<%= banner %>'
      },
      "dist": {
        src: '<%= concat.dist.dest %>',
        dest: 'dist/<%= pkg.name %>.min.js'
      }
    },
    jshint: {
      options: {
        curly: true,
        eqeqeq: true,
        immed: true,
        latedef: true,
        newcap: true,
        noarg: true,
        sub: true,
        undef: true,
        unused: true,
        boss: true,
        eqnull: true,
        browser: true,
        globals: {
          jQuery: true,
          _: true,
          global: true
        }
      },
      "gruntfile": {
        src: 'Gruntfile.js'
      },
      "source": {
        src: ['lib/**/*.js']
      }
    },
    jasmine: {
      "source": {
        src: '<%= concat.dist.dest %>',
        options: {
          keepRunner:true,
          specs: 'test/*-spec.js',
          helpers: [
            'node_modules/underscore/underscore.js',
            'test/*-helper.js'
          ]
        }
      }
    },
    watch: {
      "gruntfile": {
        files: '<%= jshint.gruntfile.src %>',
        tasks: ['jshint:gruntfile']
      },
      "source": {
        files: '<%= jshint.source.src %>',
        tasks: ['jshint:source', 'jasmine']
      },
      "test": {
        files: '<%= jasmine.source.options.specs %>',
        tasks: ['jasmine']
      }
    }
  });

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jasmine');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');

  // Default task.
  grunt.registerTask('default', ['jshint', 'concat', 'jasmine', 'uglify']);

};
