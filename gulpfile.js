const gulp = require('gulp'); 
const less = require('gulp-less');
const path = require('path');
const shell = require('shelljs');

gulp.task('less', function () {
  return gulp.src('./app/index.less')
    .pipe(less())
    .pipe(gulp.dest('./app'));
});

gulp.task('install', function(){
  
  shell.cd('app');
  shell.exec('npm install');
  shell.exec('bower install');
  
  console.log();
  console.log('************************************************');
  console.log('       Livewire installed');
  console.log('************************************************');
  console.log();
  
  return;
});