var gulp = require('gulp');
var concat = require('gulp-concat');
var argv = require('yargs').argv;
var multiEntry = require('rollup-plugin-multi-entry').default;
var babel = require('rollup-plugin-babel');
var rollup = require('rollup-stream');
var jscs = require('gulp-jscs');
var jshint = require('gulp-jshint');
var sourcemaps = require('gulp-sourcemaps');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');
var plumber = require('gulp-plumber');
var buffer = require('vinyl-buffer');
var source = require('vinyl-source-stream');
var clean = require('gulp-clean');
var Server = require('karma').Server;

var sources = ['src/c.js', 'src/h.js', 'src/models.js', 'src/root/**/*.js','src/c/**/*.js','src/**/*.js'];
var tests = ['spec/components/**/*.spec.js', 'src/**/*.js'];

gulp.task('bundle-tests', function(done){
    rollup({
      entry: tests,
      sourceMap: true,
      format: 'iife',
      moduleName: 'catarseSpecs',
      plugins: [babel({
          exclude: 'node_modules/**',
          "presets": [ "es2015-rollup" ]
      }), multiEntry()],
      globals: {
          underscore: '_',
          moment: 'moment',
          mithril: 'm',
          'chartjs': 'Chart',
          'replaceDiacritics': 'replaceDiacritics',
          'mithril-postgrest': 'postgrest',
          'i18n-js': 'I18n'
      }
    })
    .pipe(source('spec/components/**/*.spec.js', 'src/**/*.js'))
    .pipe(buffer())
    .pipe(sourcemaps.init({loadMaps: true}))
    .pipe(rename('bundle.spec.js'))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('./spec'))
    .on('end', done);
});

gulp.task('clean-tests', ['karma'], function() {
    gulp.src('spec/bundle.spec.js', {read: false})
        .pipe(clean());
});

gulp.task('karma', ['bundle-tests'],function(done) {
  new Server({
    configFile: __dirname + '/karma.conf.js'
  }, done).start();
});


gulp.task('lint', function(){
  gulp.src(sources)
    .pipe(plumber())
    .pipe(jscs())
    .pipe(jshint());
});


gulp.task('dist', function(done){
    rollup({
        entry: 'src/c.js',
        format: 'iife',
        moduleName: 'c',
        sourceMap: true,
        plugins: [
            babel({
              exclude: 'node_modules/**',
              "presets": [ "es2015-rollup" ]
            })
        ],
        globals: {
            underscore: '_',
            moment: 'moment',
            mithril: 'm',
            'chartjs': 'Chart',
            'replaceDiacritics': 'replaceDiacritics',
            'mithril-postgrest': 'postgrest',
            'i18n-js': 'I18n'
        }
    })
    .pipe(source('src/**/*.js'))
    .pipe(buffer())
    .pipe(sourcemaps.init({loadMaps: true}))
    .pipe(sourcemaps.write())
    .pipe(rename('catarse.js'))
    .pipe(gulp.dest('dist'))
    .pipe(uglify())
    .pipe(rename('catarse.min.js'))
    .pipe(gulp.dest('dist'))
    .on('end', done);
});

gulp.task('watch', function(){
    (argv.q) ? gulp.watch(sources, ['dist']) :
    (argv.notest) ? gulp.watch(sources, ['lint', 'dist']) :
    gulp.watch(sources.concat(tests), ['test', 'lint', 'dist']);
});

gulp.task('default', ['watch']);
gulp.task('test', ['bundle-tests', 'karma', 'clean-tests']);
gulp.task('build', ['lint', 'test', 'dist']);
