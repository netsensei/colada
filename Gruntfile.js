module.exports = function (grunt) {
  "use strict";

  var neat = require('node-neat').includePaths;

  console.log(neat);

  // Config...
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    copy: {
      css : {
        src: 'css/**',
        dest: 'www/'
      }
    },

    shell: {
      jekyll: {
        command: 'rm -rf www/*; jekyll build',
        stdout: true
      }
    },

    watch: {
      options: {
        livereload: true
      },
      html: {
        files: ['**/*.html', '**/*.markdown', '!www/**'],
        tasks: ['shell:jekyll']
      },
      css: {
        files: ['./_sass/**/*.scss'],
        tasks: ['sassCopy']
      }
    },

    sass: {
      options: {
        includePaths: neat,
      },
      dev: {
        files: {
          './css/screen.css': '_sass/screen.scss',
          './css/ie.css': '_sass/ie.scss',
          './css/print.css': '_sass/print.scss'
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

    compass: {
      dev: {
        options: {
          config: './config.rb',
          sassDir: './_sass',
          cssDir: './css',
          environment: 'development'
        }
      },
      prod: {
        options: {
        config: './config.rb',
        sassDir: './sass',
        cssDir: './css',
        environment: 'production',
          force: true
        }
      }
    },

    connect: {
      server: {
        options: {
          livereload: true,
          base: 'www/',
          port: 9009
        }
      }
    }

  });

  // Load tasks...
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-compass');
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
