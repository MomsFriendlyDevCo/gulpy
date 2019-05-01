var gulp = require('gulp');

gulp.wrapFuncs = ids =>
	ids.map(id => {
		if (typeof id == 'string' && !gulp.task(id)) { // Reference and not yet declared?
			return async ()=> {
				return gulp.task(id)();
			};
		} else {
			return id;
		}
	});


gulp._gulpyRawSeries = gulp.series;
gulp.series = (...ids) =>
	gulp._gulpyRawSeries(
		...gulp.wrapFuncs(ids)
	);

module.exports = gulp;
