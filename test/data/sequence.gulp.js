var gulp = require('../..');

// Basic task types: async, promises, promise factories and plain
gulp.task('a1', async ()=> {
	console.log('-a1 start');
	return await new Promise(resolve =>
		setTimeout(()=> {
			console.log('-a1 end')
			resolve();
		}, 100)
	);
});

gulp.task('a2', ()=> new Promise(resolve => {
	console.log('-a2 start')
	setTimeout(()=> {
		console.log('-a2 end');
		resolve();
	});
}));


gulp.task('a3', ()=> {
	console.log('-a3 start');
	console.log('-a3 end');
});



// Named tasks where the task is already declared
gulp.task('b1:func', async ()=> {
	console.log('-b1 start');
	return await new Promise(resolve =>
		setTimeout(()=> {
			console.log('-b1 end')
			resolve();
		}, 100)
	);
});
gulp.task('b1', ['b1:func']);


gulp.task('b2:func', ()=> new Promise(resolve => {
	console.log('-b2 start')
	setTimeout(()=> {
		console.log('-b2 end');
		resolve()
	});
}));
gulp.task('b2', ['b2:func']);


gulp.task('b3:func', ()=> {
	console.log('-b3 start');
	console.log('-b3 end');
});
gulp.task('b3', ['b3:func']);


// Named tasks where the task does not already exist
gulp.task('c1', ['c1:func']);
gulp.task('c1:func', async ()=> {
	console.log('-c1 start');
	return await new Promise(resolve =>
		setTimeout(()=> {
			console.log('-c1 end')
			resolve();
		}, 100)
	);
});


gulp.task('c2', ['c2:func']);
gulp.task('c2:func', ()=> new Promise(resolve => {
	console.log('-c2 start')
	setTimeout(()=> {
		console.log('-c2 end');
		resolve();
	});
}));


gulp.task('c3', ['c3:func']);
gulp.task('c3:func', ()=> {
	console.log('-c3 start');
	console.log('-c3 end');
});


gulp.task('start', ()=> console.log('-start'));
gulp.task('end', ()=> console.log('-end'));
gulp.task('basic', gulp.series('start', 'a1', 'a2', 'a3', 'end'));
gulp.task('alias-defined', gulp.series('start', 'b1', 'b2', 'b3', 'end'));
gulp.task('alias-future', gulp.series('start', 'c1', 'c2', 'c3', 'end'));
gulp.task('all', gulp.series('start', 'basic', 'alias-defined', 'alias-future', 'end'));
