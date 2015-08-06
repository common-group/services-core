(function(){
  'use strict';

  module.exports = function(grunt){
    var sources = [
      'src/models/**/*.js',
      'src/*.js',
      'src/**/**/*.js',
      'src/**/*.js'
    ],
    testVendor = [
      'spec/lib/mithril-query/mithril-query.js',
      'spec/lib/jasmine-species/jasmine-grammar.js',
      'spec/lib/jasmine-matchers.js',
      'spec/lib/jasmine-ajax/mock-ajax.js',
      'spec/lib/matchers.js',
      'bower_components/mithril/mithril.js',
      'bower_components/underscore/underscore.js',
      'bower_components/mithril.postgrest/src/mithril.postgrest.js',
      'bower_components/moment/moment.js',
      'bower_components/moment-timezone/moment-timezone.js',
      'bower_components/replace-diacritics/index.js',
      'spec/lib/mocks/*mock.js'
    ];

    grunt.initConfig({
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
            'dist/catarse.js': sources
          }
        },

        min: {
          files: {
            'dist/catarse.min.js': sources
          }
        }
      },

      jasmine: {
        full: {
          src: sources,
          options: {
            specs: 'spec/**/*[S|s]pec.js',
            vendor: testVendor
          }
        }
      },

      jshint: {
        all: ['Gruntfile.js', 'spec/**/*.js', 'src/**/*.js'],
        options: {
          reporter: require('jshint-stylish')
        }
      },

      jscs: {
        src: sources,
        options: {
          config: '.jscsrc'
        }
      },

      watch: {
        scripts: {
          files: ['src/**/*.js', 'spec/**/*.spec.js'],
          tasks: ['test', 'uglify']
        },
      }
    });

    require('load-grunt-tasks')(grunt);

    grunt.registerTask('test', ['browserify', 'jshint', 'jscs', 'jasmine']);
    grunt.registerTask('default', ['test', 'jshint', 'jscs', 'uglify']);
  };
}());
