const gulp = require('gulp');
const jscs = require('gulp-jscs');
const jshint = require('gulp-jshint');
const plumber = require('gulp-plumber');
const Server = require('karma').Server;

gulp.task('karma', (done) => {
    new Server({
        configFile: `${__dirname}/karma.conf.js`
    }, done).start();
});

gulp.task('lint', () => {
    gulp.src(['src/**/*.js'])
    .pipe(plumber())
    .pipe(jscs())
    .pipe(jshint());
});

// gulp.task('test', ['lint', 'karma']);
gulp.task('test', ['karma']);
