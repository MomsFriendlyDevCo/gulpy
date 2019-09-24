var gulp = require('../..');

gulp.task('default', ['foo']);
gulp.task('foo', 'bar', ()=> console.log('Out:Foo'));
gulp.task('bar', ['baz'], ()=> console.log('Out:Bar'));
gulp.task('baz', 'baz:real');
gulp.task('baz:real', ()=> console.log('Out:Baz'));

gulp.on('start', ()=> console.log('Event:Start'));
gulp.on('taskStart', task => console.log('Event:taskStart', task.id));
gulp.on('taskEnd', task => console.log('Event:taskEnd', task.id));
gulp.on('finish', ()=> console.log('Event:Finish'));
