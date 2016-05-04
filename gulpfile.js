var gulp = require('gulp');
var concat = require('gulp-concat');
var argv = require('yargs').argv;
var babel = require('rollup-plugin-babel');
var rollup = require('gulp-rollup');
var jscs = require('gulp-jscs');
var jshint = require('gulp-jshint');
var sourcemaps = require('gulp-sourcemaps');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');
var plumber = require('gulp-plumber');
var Server = require('karma').Server;

var sources = ['src/c.js', 'src/h.js', 'src/models.js', 'src/root/**/*.js','src/c/**/*.js','src/**/*.js'];
var tests = ['spec/**/*.spec.js'];

gulp.task('test', function(done) {
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
  gulp.src('src/c.js')
  .pipe(plumber())
  .pipe(sourcemaps.init())
    .pipe(rollup({
      entry: 'src/c.js',
      format: 'iife',
      moduleName: 'c',
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
          ['mithril-postgrest']: 'postgrest',
          ['i18n-js']: 'I18n'
      }
    }))
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
gulp.task('build', ['lint', 'test', 'dist']);
