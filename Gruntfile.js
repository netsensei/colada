module.exports = function (grunt) {
  "use strict";

  var neat = require('node-neat').includePaths;

  // Config...
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    copy: {
      css : {
        src: 'css/**',
        dest: '_site/'
      }
    },

    shell: {
      jekyll: {
        command: 'rm -rf _site/*; jekyll build --drafts',
        stdout: true
      }
    },

    sass: {
      options: {
        includePaths: neat,
      },
      dev: {
        options: {
          outputStyle: 'expanded'
        },
        files: {
          './css/screen.css': 'sass/screen.scss',
          './css/ie.css': 'sass/ie.scss',
          './css/print.css': 'sass/print.scss'
        }
      },
      prod: {
        options: {
          outputStyle: 'compressed'
        },
        files: {
          './css/screen.css': 'sass/screen.scss',
          './css/ie.css': 'sass/ie.scss',
          './css/print.css': 'sass/print.scss'
        }
      }
    },

    watch: {
      options: {
        livereload: true
      },
      html: {
        files: ['**/*.html', '**/*.markdown', '!_site/**'],
        tasks: ['shell:jekyll']
      },
      sass: {
        files: ['./sass/**/*.scss'],
        tasks: ['sassCopy']
      }
    },

    connect: {
      server: {
        options: {
          hostname: '*',
          livereload: true,
          base: '_site/',
          port: 9009
        }
      }
    }
  });

  // Load tasks...
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-shell');
  grunt.loadNpmTasks('grunt-sass');

  // Define a compass compile & copy task for livereload
  grunt.registerTask('sassCopy', ['sass:dev', 'copy:css']);
  grunt.registerTask('server', ['connect:server', 'watch']);

  // Default task.
  grunt.registerTask('default', 'server');
};
