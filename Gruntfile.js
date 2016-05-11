module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON("package.json"),


    bgShell: {
      install: {
        cmd: 'pyvenv-3.5 '+ __dirname +'/environment && source '+ __dirname +'/environment/bin/activate && pip install -r requirements.txt',
        bg: false,
        stdout: false
      },
      server: {
        cmd: 'source '+ __dirname +'/environment/bin/activate && python server.py',
        bg: false,
        stdout: false
      }
    },


    handlebars: {
      compile: {
        options: {
          namespace: "templates",
          processContent: function(content, filepath) {
            content = content.replace(/^[\x20\t]+/mg, '').replace(/[\x20\t]+$/mg, '');
            content = content.replace(/^[\r\n]+/, '').replace(/[\r\n]*$/, '\n');
            return content;
          },
          processName: function(filePath) {
            var name = "";
            filePath = filePath.split(".");
            filePath = filePath[0].split("/");
            name += filePath[3];
            for (var i = 4; i < filePath.length; i++) {
                name += "/" + filePath[i];
            };
            return name;
          }
        },
        files: {
          "core/build/templates.js": ["core/source/hbs/**/*.hbs"]
        }
      }
    },



    sass: {
      compile: {
        options: {
          outputStyle: 'compressed'
        },
        files: {
            'core/build/all.css': 'core/source/scss/all.scss',
        }
      }
    },

    
    coffee: {
      compile: {
        files: {
          'core/build/app.js': [
            'core/source/coffee/app.coffee',
            'core/source/coffee/core/**/*.coffee',
            'core/source/coffee/models/**/*.coffee',
            'core/source/coffee/collections/**/*.coffee',
            'core/source/coffee/views/**/*.coffee',
            'core/source/coffee/routers/router.coffee']
        }
      }
    },

    open: {
      start: {
        path: 'http://localhost:5000',
        app: 'Google Chrome'
      }
    },

    watch: {
      options: {
        livereload: {
          host: 'localhost',
          port: 9000
        }
      },
      html: {
        files: ['core/templates/**/*.html']
      },
      handlebars: {
        files: ['core/source/hbs/**/*.hbs'],
        tasks: ['handlebars']
      },
      sass: {
        options: {
          livereload: false
        },
        files: ['core/source/scss/**/*.scss'],
        tasks: ['sass']
      },
      css: {
        files: 'core/build/all.css'
      },
      coffee: {
        files: ['core/source/coffee/**/*.coffee'],
        tasks: ['coffee']
      }
    }


  });


  grunt.loadNpmTasks('grunt-bg-shell');
  grunt.loadNpmTasks('grunt-contrib-handlebars');
  grunt.loadNpmTasks('grunt-contrib-coffee');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-sass');
  grunt.loadNpmTasks('grunt-open');

  grunt.registerTask('install', ['bgShell:install']);
  grunt.registerTask('start', ['bgShell:server']);
  grunt.registerTask('compilers', ['handlebars', 'sass', 'coffee', 'open', 'watch']);
  grunt.registerTask('default', ['compilers']);

};



