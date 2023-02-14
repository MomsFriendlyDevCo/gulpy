var gulp = require('../..');

gulp.task('foo', ()=> Promise.resolve(console.log('FOO=' + gulp.hasUserTask('foo'))));
gulp.task('bar', ['foo'], ()=> Promise.resolve(console.log('BAR=' + gulp.hasUserTask('bar'))));
gulp.task('baz', ['bar'], ()=> Promise.resolve(console.log('BAZ=' + gulp.hasUserTask('baz'))));
