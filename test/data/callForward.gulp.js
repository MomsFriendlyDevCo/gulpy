var gulp = require('gulp');
require('../..');

gulp.task('foo', gulp.series('bar', async ()=> console.log('Out:Foo')));
gulp.task('bar', gulp.series('baz', async ()=> console.log('Out:Bar')));
gulp.task('baz', async ()=> console.log('Out:Baz'));
