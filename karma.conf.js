module.exports = (config) => {
    config.set({
        basePath: '',
        frameworks: ['jasmine'],
        files: [
            'spec/lib/mithril-query/mithril-query.js',
            'spec/lib/jasmine-species/jasmine-grammar.js',
            'spec/lib/jasmine-matchers.js',
            'spec/lib/jasmine-ajax/mock-ajax.js',
            'spec/lib/i18n/i18n.js',
            'spec/lib/matchers.js',
            'spec/lib/analytics.js',
            'node_modules/mithril/mithril.js',
            'node_modules/underscore/underscore.js',
            'node_modules/liquidjs/dist/liquid.js',
            'node_modules/mithril-postgrest/dist/mithril-postgrest.js',
            'node_modules/chart.js/Chart.js',
            'node_modules/moment/moment.js',
            'node_modules/select/dist/select.js',
            'node_modules/jquery/dist/jquery.min.js',
            'vendor/replaceDiacritics.js',
            'spec/lib/mocks/*mock.js',
            'spec/index.spec.js',
        ],
        preprocessors: {
            'spec/**/*.spec.js': ['webpack'],
            'spec/index.spec.js': ['webpack']
        },
        exclude: [],
        reporters: ['spec'],
        port: 9876,
        colors: true,
        logLevel: config.LOG_INFO,
        browsers: ['NodeWebkitHidden'],
        customLaunchers: {
            NodeWebkitHidden: {
                base: 'NodeWebkit',
                options: {
                    window: {
                        show: false,
                    }
                }
            }
        },
        singleRun: true
    });
};
