var gulp = require('gulp');
require('../..');

gulp.task('default', ['foo']);
gulp.task('foo', 'bar', ()=> console.log('Out:Foo'));
gulp.task('bar', ['baz'], ()=> console.log('Out:Bar'));
gulp.task('baz', 'baz:real');
gulp.task('baz:real', ()=> console.log('Out:Baz'));
