var gulp = require('gulp');
var serve = require('gulp-serve');
var uglify = require('gulp-uglify');

gulp.task('default', function(){
  gulp.src('src/gamecontroller.js')
  .pipe(uglify({mangle: false}))
  .pipe(gulp.dest('dist/gamecontroller.min.js'));
});

gulp.task('serve', serve(['src', 'tests']));
