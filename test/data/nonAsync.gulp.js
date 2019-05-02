var gulp = require('../..');

gulp.task('foo', gulp.series('bar', ()=> console.log('Out:Foo')));
gulp.task('bar', gulp.series('baz', done => {
	if (!done) throw new Error('Callback not given');
	console.log('Out:Bar');
	setTimeout(done, 100);
}));
gulp.task('baz', ()=> console.log('Out:Baz'));
