// Karma configuration
// Generated on Sat Sep 05 2015 18:32:11 GMT-0300 (BRT)

module.exports = function(config) {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',


    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['jasmine'],


    // list of files / patterns to load in the browser
    files: [
      'spec/lib/mithril-query/mithril-query.js',
      'spec/lib/jasmine-species/jasmine-grammar.js',
      'spec/lib/jasmine-matchers.js',
      'spec/lib/jasmine-ajax/mock-ajax.js',
      'spec/lib/i18n/i18n.js',
      'spec/lib/matchers.js',
      'node_modules/mithril/mithril.js',
      'node_modules/underscore/underscore.js',
      'bower_components/mithril-postgrest/mithril-postgrest.umd.js',
      'bower_components/chartjs/Chart.js',
      'node_modules/moment/moment.js',
      'bower_components/replace-diacritics/index.js',
      'spec/lib/mocks/*mock.js',
      'spec/bundle.spec.js',
    ],

    // list of files to exclude
    exclude: [
    ],

    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['spec'],


    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,


    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['NodeWebkitHidden'],
    customLaunchers: {
        'NodeWebkitHidden': {
          base: 'NodeWebkit',
          options: {
              window: {
                show: false,
              }
          }
        }
    },

    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: true
  })
}
