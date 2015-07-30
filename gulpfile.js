var gulp = require('gulp'); 
var less = require('gulp-less');
var path = require('path');

gulp.task('less', function () {
  return gulp.src('./app/index.less')
    .pipe(less())
    .pipe(gulp.dest('./app'));
});