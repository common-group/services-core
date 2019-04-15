const gulp = require('gulp');
const plumber = require('gulp-plumber');
const Server = require('karma').Server;

gulp.task('karma', (done) => {
    new Server({
        configFile: `${__dirname}/karma.conf.js`
    }, done).start();
});

gulp.task('test', ['karma']);
