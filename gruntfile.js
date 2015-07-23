
"use strict";

module.exports = function( grunt ) {
  var sources = [
    'src/*.js', 
    'src/models/**/*.js',
    'src/components/contributions/**/*.js',
    'src/components/admin/**/*.js',
    'src/components/transactions/**/*.js',
    'src/**/*.js'
  ];
  grunt.initConfig({
    // TODO: change to read component.json
    pkg: require('./package.json'),

    browserify: {
      dist: {
        src: ['spec/lib/mithril-query/src/mithril-query.js'],
        dest: 'spec/lib/mithril-query/mithril-query.js'
      }
    },

    uglify: {
      options: {
        banner: '/*\n    <%= pkg.description %>\n    Copyright (c) 2007 - <%= grunt.template.today("yyyy") %> <%= pkg.author %>\n    Licensed under the MIT license (http://digitalbush.com/projects/masked-input-plugin/#license)\n    Version: <%= pkg.version %>\n*/\n'
      },

      dev: {
        options: {
          beautify: true,
          mangle: false
        },

        files: {
          'dist/catarse_admin.js': sources
        }
      },

      min: {
        files: {
          'dist/catarse_admin.min.js': sources
        }
      }
    },

    jasmine: {
      full: {
        src: sources,
        options: {
          specs: "spec/**/*[S|s]pec.js",
          vendor: [
            "spec/lib/mithril-query/mithril-query.js",
            "spec/lib/jasmine-species/jasmine-grammar.js",
            "spec/lib/jasmine-matchers.js",
            "spec/lib/jasmine-ajax/mock-ajax.js",
            "spec/lib/matchers.js",
            "bower_components/mithril/mithril.js",
            "bower_components/underscore/underscore.js",
            "bower_components/mithril.postgrest/src/mithril.postgrest.js",
            "bower_components/moment/moment.js",
            "spec/lib/mocks/*mock.js"
          ]
        }
      }
    },

    watch: {
      scripts: {
        files: ['src/**/*.js', 'spec/**/*.spec.js'],
        tasks: ['test', 'uglify']
      },
    }
  });

  grunt.loadNpmTasks("grunt-browserify");
  grunt.loadNpmTasks("grunt-contrib-jasmine");
  grunt.loadNpmTasks("grunt-contrib-uglify");
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.registerTask('test', ['browserify','jasmine']);
  grunt.registerTask('default', ['test', 'uglify']);
};
