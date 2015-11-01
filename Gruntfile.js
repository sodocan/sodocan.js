module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    
    concat: {
      dist: {
        //
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
          '': [
            // insert
          ]
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

    cssmin: {
      dist: {
        files: {
          'public/dist/style.min.css': 'public/client/css/*.css'
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
        files: 'public/client/css/*.css',
        tasks: ['cssmin']
      }
    },
    
    // drops jupiter database
    'mongo-drop': {
      options: {
        dbname: 'jupitr',
        host: 'localhost'
      }
    },
  });

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-cssmin'); 
  grunt.loadNpmTasks('grunt-mocha-test');

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
