'use strict';

const gulp = require('gulp');
const mocha = require('gulp-mocha');
const istanbul = require('gulp-istanbul');
const rimraf = require('rimraf');
const codecov = require('gulp-codecov');
const plumber = require('gulp-plumber');

let coverageVariable;

gulp.task('clean', cb => rimraf('./coverage', cb));

gulp.task('instrument', ['clean'], () => {
  coverageVariable = '$$cov_' + new Date().getTime() + '$$';

  return gulp.src(['src/**/*.js'])
    .pipe(plumber())
    .pipe(istanbul({ coverageVariable }))
    .pipe(istanbul.hookRequire());
});

gulp.task('test', ['clean', 'instrument'], () => {
  return gulp.src(['test/index.js'])
    .pipe(mocha())
    .pipe(istanbul.writeReports({ coverageVariable }));
});

gulp.task('codecov', () => {
  gulp.src('coverage/coverage-final.json')
    .pipe(codecov());
});

gulp.task('watch', () => {
  gulp.watch(['src/**/*.js', 'test/**/*.js'], ['test']);
});

gulp.task('default', ['test']);
