var gulp = require('gulp');
var rename = require('gulp-rename');
var serve = require('gulp-serve');
var uglify = require('gulp-uglify');

gulp.task('default', function(){
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

gulp.task('serve', serve(['src', 'tests']));
