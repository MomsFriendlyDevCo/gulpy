var gulp = require('gulp');

gulp.seriesRaw = gulp.series;
gulp.series = (...ids) => {
	console.warn('Wrap series', ids);
	return gulp.seriesRaw(
		...ids.map(id => {
			if (typeof id == 'string' && !gulp.task(id)) { // Reference and not yet declared?
				return async ()=> {
					console.log('RAW CALL', id);
					return gulp.task(id)();
				};
			} else {
				return id;
			}
		})
	);
}
