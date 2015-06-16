
"use strict";

module.exports = function( grunt ) {
  grunt.initConfig({
    // TODO: change to read component.json
    pkg: require('./package.json'),

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
          'dist/catarse_admin.js': ['src/catarse_admin.js']
        }
      },

      min: {
        files: {
          'dist/catarse_admin.min.js': ['src/catarse_admin.js']
        }
      }
    },

    jasmine: {
      full: {
        src: "src/**/*.js",
        options: {
          specs: "spec/**/*[S|s]pec.js",
          vendor: [
            "spec/lib/jasmine-species/jasmine-grammar.js",
            "spec/lib/matchers.js",
            "spec/lib/mocks/*mock.js",
            "bower_components/**/*.js"
          ]
        }
      }
    }
  });

  grunt.loadNpmTasks("grunt-contrib-jasmine");
  grunt.loadNpmTasks("grunt-contrib-uglify");

  grunt.registerTask('test', ['jasmine']);
  grunt.registerTask('default', ['test', 'uglify']);
};
