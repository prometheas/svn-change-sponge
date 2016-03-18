/* eslint no-console: 0 */
'use strict';

var gulp = require('gulp');
var mocha = require('gulp-mocha');

// Error.stackTraceLimit = 2;

gulp.task('test', function runTests() {
  gulp
    .src('test/**/*.spec.js', {
      read: false
    })
    .pipe(mocha())
    .on('error', function reportError(e) {
      console.warn(e.message);
      this.emit('end');
    });
});

gulp.task('watch-test', function watchFiles() {
  gulp.watch([
    'lib/*.js',
    'lib/**/*.js',
    'test/**/*.spec.js'
  ], ['test']);
});

gulp.task('default', ['test', 'watch-test']);
