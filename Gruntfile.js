module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    
    concat: {
      dist: {
        src: [
          // insert
        ],
        //insert
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
          //insert
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
        files: '', // insert
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

    shell: {
      
      // seeds database with 50 records
      seeddb: {
        command: 'node db/seed-data.js 50'
      },
      
      // rebases from upstream staging
      rebase: {
        command: 'git pull --rebase upstream staging'
      },
      
      // pushes to remote origin branch
      push: {
        command: 'git push origin'
      },
      
      // installs dependencies via npm and bower
      depends: {
        command: 'npm install'
      }
      
    }
  });

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-cssmin'); 
  grunt.loadNpmTasks('grunt-mocha-test');
  grunt.loadNpmTasks('grunt-shell');
  grunt.loadNpmTasks('grunt-nodemon');

  grunt.registerTask('server-dev', function (target) {
    // Running nodejs in a different process and displaying output on the main console
    var nodemon = grunt.util.spawn({
         cmd: 'grunt',
         grunt: true,
         args: 'nodemon'
    });
    nodemon.stdout.pipe(process.stdout);
    nodemon.stderr.pipe(process.stderr);

    grunt.task.run([ 'watch' ]);
  });

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

  // TODO -- add build processes    
  grunt.registerTask('build', [
    // 'concat',
    // 'uglify',
    // 'cssmin'
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
