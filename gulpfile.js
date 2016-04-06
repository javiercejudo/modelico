'use strict';

const gulp = require('gulp');
const mocha = require('gulp-mocha');
const istanbul = require('gulp-istanbul');
const rimraf = require('rimraf');
const codecov = require('gulp-codecov');

let coverageVariable;

gulp.task('clean', function (cb) {
  rimraf('./coverage', cb);
});

gulp.task('instrument', ['clean'], function () {
  coverageVariable = '$$cov_' + new Date().getTime() + '$$';

  return gulp.src(['src/**/*.js'])
    .pipe(istanbul({ coverageVariable }))
    .pipe(istanbul.hookRequire());
});

gulp.task('test', ['clean', 'instrument'], function () {
  return gulp.src(['test/index.js'])
    .pipe(mocha())
    .on('error', function handleMochaError(err) {
      console.error(err.toString());
      this.emit('end');
    })
    .pipe(istanbul.writeReports({ coverageVariable }));
});

gulp.task('codecov', function () {
  gulp.src('coverage/coverage-final.json')
    .pipe(codecov());
});

gulp.task('watch', function() {
  gulp.watch(['src/**/*.js', 'test/**/*.js'], ['test']);
});

gulp.task('default', ['test']);
