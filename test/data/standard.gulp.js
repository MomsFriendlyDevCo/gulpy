var gulp = require('gulp');
require('../..');

gulp.task('foo', async ()=> console.log('Out:Foo'));
gulp.task('bar', async ()=> console.log('Out:Bar'));
gulp.task('baz', gulp.series('foo', 'bar', async ()=> console.log('Out:Baz')));
