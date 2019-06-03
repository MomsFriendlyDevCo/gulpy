var autopsy = require('@momsfriendlydevco/autopsy');
var debug = require('debug')('gulpy');
var gulp = require('gulp');
var util = require('util');

function Gulpy() {
	this.gulp = gulp; // Inherit the regular gulp instance into gulpy.gulp
	this.isGulpy = true; // Marker so we know if the original gulp instance has already been mutated
	Object.assign(this, gulp); // Act like gulp

	// gulp.task() {{{
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

	// gulp.task.once() {{{
	this.task.once = (id, ...chain) => {
		var func = chain[chain.length-1];
		if (typeof func != 'function') throw new Error('The last argument to gulp.task.once(id, [prereqs], func) must be a function');

		var hasRun = false;
		chain[chain.length-1] = async ()=> {
			if (hasRun) return;
			hasRun = true;
			return func();
		};

		return this.task(id, ...chain);
	};
	// }}}

	// Utility wrapper for series / parallel to return a call-forward task {{{
	this.wrapFuncs = ids =>
		ids.map(id => {
			var wrapper;
			if (typeof id == 'string' && !this.gulp.task(id)) { // Reference and not yet declared?
				debug('Wrap call-forward task', id);
				wrapper = async ()=> {
					return this.task(id)();
				};
				wrapper.displayName = typeof id == 'string' ? id : '<task>';
				return wrapper;
			} else if (typeof id == 'function' && autopsy.identify(id) == 'plain') {
				debug('Wrap non-async task', id);
				wrapper = ()=> Promise.resolve(id());
				wrapper.displayName = typeof id == 'string' ? id : '<task>';
				return wrapper;
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

	// gulp.start() {{{
	this.start = (...args) => gulp.series(...args)();
	// }}}

	// Event: finish {{{
	var running = new Set();
	var runningTimer;
	this.gulp.on('start', task => running.add(task.uid));
	this.gulp.on('stop', task => {
		running.delete(task.uid);

		if (runningTimer) clearTimeout(runningTimer);
		runningTimer = setTimeout(()=> { // Queue on next tick so we're sure Gulp has flushed
			if (running.size) return; // Another task has waited within the tick
			this.emit('finish')
		}, 200)
	});

	['on', 'once', 'off', 'emit'].forEach(m => this[m] = this.gulp[m]);
	// }}}

	return this;
};

var inst = new Gulpy();
inst.mutate = ()=> {
	if (gulp.isGulpy) return gulp; // Already mutated

	inst.gulp = {...gulp}; // Shallow copy of gulp so we can reassign the original pointers

	['task', 'parallel', 'series'].forEach(f => {
		var originalFunc = gulp[f];
		gulp[f] = inst[f];
		inst.gulp[f] = originalFunc;
	});

	gulp.isGulpy = true; // Mark as a mutated gulp(y) object

	return inst;
};

module.exports = inst;
