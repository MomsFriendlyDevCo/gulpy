var gulp = require('gulp');

// Wrap gulp.task {{{
gulp._gulpyRawTask = gulp.task;
/*gulp.task = (id, func) => {

};*/
// }}}

// Utility wrapper for series / parallel to return a call-forward task {{{
gulp.wrapFuncs = ids =>
	ids.map(id => {
		if (typeof id == 'string' && !gulp.task(id)) { // Reference and not yet declared?
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
