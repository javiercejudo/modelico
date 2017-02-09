'use strict'

const gulp = require('gulp')
const mocha = require('gulp-mocha')
const istanbul = require('gulp-istanbul')
const rimraf = require('rimraf')
const codecov = require('gulp-codecov')
const plumber = require('gulp-plumber')

let coverageVariable

gulp.task('clean', cb => rimraf('./coverage', cb))

gulp.task('instrument', ['clean'], () => {
  coverageVariable = '$$cov_' + new Date().getTime() + '$$'

  return gulp.src([
    'dist/modelico.js'
  ])
    .pipe(plumber())
    .pipe(istanbul({ coverageVariable }))
    .pipe(istanbul.hookRequire())
})

gulp.task('test', ['clean', 'instrument'], () => {
  return gulp.src(['test/index.js'])
    .pipe(
      mocha({ bail: false })
        .on('error', process.exit.bind(process, 1))
    )
    .pipe(istanbul.writeReports({ coverageVariable }))
})

gulp.task('codecov', () => gulp.src('coverage/coverage-final.json').pipe(codecov()))

gulp.task('default', ['test'])
