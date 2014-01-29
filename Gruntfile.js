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
        command: 'rm -rf _site/*; jekyll build',
        stdout: true
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
      css: {
        files: ['./sass/**/*.scss'],
        tasks: ['sassCopy']
      }
    },

    sass: {
      options: {
        includePaths: neat,
      },
      dev: {
        files: {
          './css/screen.css': 'sass/screen.scss',
          './css/ie.css': 'sass/ie.scss',
          './css/print.css': 'sass/print.scss'
        }
      },
      prod: {
        files: {
          './css/style.css': './sass/style.scss',
          './css/ie.css': './sass/ie.scss',
          './css/print.css': './sass/print.scss',
          './css/wysiwyg.css': './sass/wysiwyg.scss'
        }
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
  grunt.registerTask('compassCopy', ['compass:dev', 'copy:css']);
  grunt.registerTask('sassCopy', ['sass:dev', 'copy:css']);
  grunt.registerTask('prod', ['compass:prod']);

  grunt.registerTask('server', [
    'connect:server',
    'watch'
  ]);

  // Default task.
  grunt.registerTask('default', 'server');
};
