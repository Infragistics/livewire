const gulp = require('gulp'); 
const less = require('gulp-less');

gulp.task('less', function () {
  return gulp.src('./app/index.less')
    .pipe(less())
    .pipe(gulp.dest('./app'));
});