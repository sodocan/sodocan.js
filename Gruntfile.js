module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    
    concat: {
      dist: {
        src: ['public/js/*.js'],
        dest: 'public/dist/<%= pkg.name %>.js'
      }
    },

    mochaTest: {
      test: {
        options: {
          reporter: 'spec'
        },
        src: [
          // insert
        ]
      }
    },

    nodemon: {
      dev: {
        script: 'index.js'
      }
    },

    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("dd-mm-yyyy") %> */\n'
      },
      dist: {
        files: {
          'public/dist/<%= pkg.name %>.min.js': ['<%= concat.dist.dest %>']
        }
      }
    },

    jshint: {
      files: [
        // insert
      ],
      options: {
        force: false,
        jshintrc: '.jshintrc',
        ignores: [
          // insert
        ]
      }
    },

    purifycss: {
      options: {},
      target: {
        src: ['public/index.html', 'public/js/*.js'],
        css: ['public/css/*.css'],
        dest: 'public/dist/purestyles.css'
      },
    },

    cssmin: {
      dist: {
        files: {
          'public/dist/style.min.css': 'public/dist/purestyles.css'
        }
      }
    },

    watch: {
      scripts: {
        files: [
          // insert
        ],
        tasks: [
          'concat',
          'uglify'
        ]
      },
      css: {
        files: 'public/css/*.css',
        tasks: ['purifycss', 'cssmin']
      }
    },
  });

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-cssmin'); 
  grunt.loadNpmTasks('grunt-mocha-test');
  grunt.loadNpmTasks('grunt-purifycss');

  ////////////////////////////////////////////////////
  //              Main grunt tasks                  //
  ////////////////////////////////////////////////////

  grunt.registerTask('server-prod', [
    'shell'
  ]);
  
  // rebases from upstream staging
  grunt.registerTask('rebase', [
    'shell:rebase'
  ]);
  
  // pushes to remote origin branch
  grunt.registerTask('push', [
    'shell:push'
  ]);

  // installs dependencies via npm and bower
  grunt.registerTask('depends', [
    'shell:depends'
  ]);
  
  // TODO -- add linting and testing
  grunt.registerTask('test', [
    // 'jshint',
    // 'mochaTest'
  ]);
  
  grunt.registerTask('build', [
    'concat',
    'uglify',
    'purifycss',
    'cssmin'
  ]);
  
  // runs server via nodemon
  grunt.registerTask('run', [
    'nodemon'
  ]);

  // runs local deployment for testing
  grunt.registerTask('local', function(){
    grunt.task.run([ 'depends', 'test', 'build', 'run' ]);
  });

};
