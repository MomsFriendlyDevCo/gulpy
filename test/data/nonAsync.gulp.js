var gulp = require('gulp');
require('../..');

gulp.task('foo', gulp.series('bar', ()=> console.log('Out:Foo')));
gulp.task('bar', gulp.series('baz', ()=> console.log('Out:Bar')));
gulp.task('baz', ()=> console.log('Out:Baz'));
