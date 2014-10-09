var gulp = require('gulp');
var shell = require('gulp-shell')

gulp.task('default', function() {
  console.log('welcome to gulp!');
});

gulp.task('test-backend-full', shell.task([
  'cd /Users/louisbichard/Documents/sites/survivorsunited/backend',
  'jasmine-node . --color '
]))

gulp.task('test-backend-dev', shell.task([
  'cd /Users/louisbichard/Documents/sites/survivorsunited/backend',
  'cd backend',
  'jasmine-node . --color '
]))

