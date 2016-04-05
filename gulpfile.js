var gulp = require('gulp');
var mocha = require('gulp-mocha');
var istanbul = require('gulp-istanbul');
var rimraf = require('rimraf');
var codecov = require('gulp-codecov');

gulp.task('clean', function (cb) {
  rimraf('./coverage', cb);
});

gulp.task('instrument', function () {
  return gulp.src(['src/*.js'])
    .pipe(istanbul())
    .pipe(istanbul.hookRequire());
});

gulp.task('test', ['clean', 'instrument'], function () {
  return gulp.src(['test/index.js'])
    .pipe(mocha())
    .pipe(istanbul.writeReports());
});

gulp.task('codecov', function () {
  gulp.src('coverage/coverage-final.json')
    .pipe(codecov());
});

gulp.task('default', ['test']);
