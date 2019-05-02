var autopsy = require('@momsfriendlydevco/autopsy');
var debug = require('debug')('gulpy');
var gulp = require('gulp');
var util = require('util');

function Gulpy() {
	this.gulp = gulp; // Inherit the regular gulp instance into gulpy.gulp

	// Wrap gulp.task {{{
	this.task = (id, ...chain) => {
		if (id && !chain.length) { // Just use as lookup
			debug('task ask', id);
			return this.gulp.task(id);
		} else if (id && chain.length == 1 && typeof chain[0] == 'function') { // Standard gulp.task() call
			debug('task standard define', id, chain[0]);
			return this.gulp.task(id, chain[0]);
		} else if (id && chain.length == 1 && Array.isArray(chain[0])) { // Chain redirector - gulp.task(id, ['foo', 'bar', 'baz'])
			debug('task chain redirect', id, chain[0]);
			return this.gulp.task(id, this.series(...chain[0]));
		} else if (id && chain.length == 1 && typeof chain[0] == 'string') { // Task redirector - gulp.task(id, 'foo')
			debug('task redirect', id, chain[0]);
			return this.gulp.task(id, this.series(chain[0]));
		} else if (id && Array.isArray(chain[0]) && typeof chain[1] == 'function') { // Function with prerequisites - gulp.task(id, ['foo'], func)
			debug('task chain prerequisite', id, chain[0]);
			return this.gulp.task(id, this.series(...chain[0], chain[1]));
		} else {
			debug('task chain', id, chain);
			return this.gulp.task(id, this.series(...chain));
		}

		return this;
	};
	// }}}

	// Utility wrapper for series / parallel to return a call-forward task {{{
	this.wrapFuncs = ids =>
		ids.map(id => {
			if (typeof id == 'string' && !this.gulp.task(id)) { // Reference and not yet declared?
				debug('Wrap call-forward task', id);
				return async ()=> {
					return this.task(id)();
				};
			} else if (typeof id == 'function' && autopsy.identify(id) == 'plain') {
				debug('Wrap non-async task', id);
				return ()=> Promise.resolve(id());
			} else {
				return id;
			}
		});
	// }}}

	// Wrap gulp.parallel {{{
	this.parallel = (...ids) =>
		this.gulp.parallel(
			...this.wrapFuncs(ids)
		);
	// }}}

	// Wrap gulp.series {{{
	this.series = (...ids) =>
		this.gulp.series(
			...this.wrapFuncs(ids)
		);
	// }}}

	return this;
};

module.exports = new Gulpy();
