var gulp = require('gulp');
var open = require('gulp-open');
var rename = require('gulp-rename');
var serve = require('gulp-serve');
var uglify = require('gulp-uglify');

gulp.task('build', function(){
  gulp.src('src/gamecontroller.js')
  .pipe(uglify({mangle: {
    GameController: false,
    window: false,
    exports: false,
    module: false,
    requestAnimationFrame: false,
    cancelAnimationFrame: false
  }}))
  .pipe(rename({suffix: '.min'}))
  .pipe(gulp.dest('dist'));
});

gulp.task('open', function(){
  gulp.src('tests/index.html')
  .pipe(open({uri: 'http://localhost:3000'}));
});

gulp.task('default', ['build']);
gulp.task('serve', serve(['src', 'tests', 'dist']));
gulp.task('test', ['serve', 'open']);

