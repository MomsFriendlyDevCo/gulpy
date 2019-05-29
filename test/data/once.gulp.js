var gulp = require('../..');

var runs = {setup: 0, foo: 0, bar: 0, build: 0};

gulp.task.once('setup', ()=> console.log('Out:Setup'));
gulp.task('foo', ['setup'], ()=> console.log('Out:Foo'))
gulp.task('bar', ['setup'], ()=> console.log('Out:Bar'));
gulp.task('fooBar', ['foo', 'bar']); // 'setup' runs only once, followed by 'foo', 'bar', in parallel
gulp.task('setupFooBar', ['setup', 'foo', 'bar']);
