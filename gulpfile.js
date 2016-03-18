/* eslint no-console: 0 */
'use strict';

var path = require('path');
var gulp = require('gulp');
var mocha = require('gulp-mocha');

function getProjectGlob(relPath) {
  return path.resolve(__dirname, relPath);
}

gulp.task('test', function runTests() {
  gulp
    .src(getProjectGlob('test/**/*.spec.js'), {
      read: true
    })
    .pipe(mocha())
    .on('error', function reportError(e) {
      console.warn(e.message);
    });
});

gulp.task('watch', function watchFiles() {
  return gulp.watch([
    getProjectGlob('lib/*.js'),
    getProjectGlob('lib/**/*.js'),
    getProjectGlob('test/**/*.spec.js')
  ], ['test']);
});

gulp.task('default', ['test', 'watch']);
