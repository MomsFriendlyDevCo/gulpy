var debug = require('debug')('slurpy');
var gulp = require('gulp');

// Wrap gulp.task {{{
gulp._gulpyRawTask = gulp.task;
gulp.task = (id, ...chain) => {
	if (id && !arguments.length) { // Just use as lookup
		surpy('task ask', id);
		return gulp._gulpyRawTask(id);
	} else if (id && chain.length == 1 && typeof chain[0] == 'function') { // Standard gulp.task() call
		console.log('task standard', id);
		return gulp._gulpyRawTask(id, chain[0]);
	} else if (id && chain.length == 1 && Array.isArray(chain[0])) { // Chain redirector - gulp.task(id, ['foo', 'bar', 'baz'])
		console.log('task chain redirect', id, chain[0]);
		return gulp._gulpyRawTask(id, gulp.series(...chain[0]));
	} else if (id && chain.length == 1 && typeof chain[0] == 'string') { // Task redirector - gulp.task(id, 'foo')
		console.log('task redirect', id, chain[0]);
		return gulp._gulpyRawTask(id, gulp.series(chain[0]));
	} else if (id && Array.isArray(chain[0]) && typeof chain[1] == 'function') { // Function with prerequisites - gulp.task(id, ['foo'], func)
		console.log('task chain prerequisite', id, chain[0]);
		return gulp._gulpyRawTask(id, gulp.series(...chain[0], chain[1]));
	} else {
		console.log('task chain', id, chain);
		return gulp._gulpyRawTask(id, gulp.series(...chain));
	}
};
// }}}

// Utility wrapper for series / parallel to return a call-forward task {{{
gulp.wrapFuncs = ids =>
	ids.map(id => {
		if (typeof id == 'string' && !gulp._gulpyRawTask(id)) { // Reference and not yet declared?
			return async ()=> {
				return gulp._gulpyRawTask(id)();
			};
		} else if (typeof id == 'function') {
			var funcDef = id.toString();
			if (/^async /.test(funcDef)) { // Already returns a (correct) async function
				return id;
			} else {
				return ()=> Promise.resolve(id());
			}
		} else {
			return id;
		}
	});
// }}}

// Wrap gulp.parallel {{{
gulp._gulpyRawParallel = gulp.parallel;
gulp.parallel = (...ids) =>
	gulp._gulpyRawParallel(
		...gulp.wrapFuncs(ids)
	);
// }}}

// Wrap gulp.series {{{
gulp._gulpyRawSeries = gulp.series;
gulp.series = (...ids) =>
	gulp._gulpyRawSeries(
		...gulp.wrapFuncs(ids)
	);
// }}}

module.exports = gulp;
