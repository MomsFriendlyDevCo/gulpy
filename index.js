var autopsy = require('@momsfriendlydevco/autopsy');
var chalk = require('chalk');
var debug = require('debug')('gulpy');
var gulp = require('gulp');
var util = require('util');
var args = require('yargs').argv;

function Gulpy() {
	this.gulp = gulp; // Inherit the regular gulp instance into gulpy.gulp
	this.isGulpy = true; // Marker so we know if the original gulp instance has already been mutated
	Object.assign(this, gulp); // Act like gulp

	gulp.log = (...msg) => {
		var now = new Date();
		console.log(
			'[' + gulp.colors.grey(now.getHours() + ':' + now.getMinutes() + ':' + now.getSeconds() + '.' + now.getMilliseconds()) + ']',
			...msg
		);
	};

	gulp.colors = chalk;

	this.settings = {
		futureTaskTries: 20,
		futureTaskWait: 50,
		taskStart: id => gulp.log(`Starting "${gulp.colors.cyan(id)}"...`),
		taskEnd: (id, time) => gulp.log(`Finished "${gulp.colors.cyan(id)}" `, gulp.colors.grey(`(${time}ms)`)),
	};

	// gulp.task() {{{
	this.task = (id, ...chain) => {
		debug('DECLARE TASK', id);
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

	// gulp.run() {{{
	/**
	* Replacement for gulp.parallel + gulp.series functions
	*
	* Supports multiple function types:
	* 	- (string) already declared tasks
	* 	- (string) future tasks (i.e. not yet present)
	* 	- Async functions
	* 	- Promises + Promise factories
	* 	- Callback functions
	* 	- Plain functions
	* 	- Array of any of the above (child items executed in parallel)
	*
	* @param {string|function|function <Promise>} [args...] Functions to execute, arrays are resolved in parallel anything else is resolved in series
	* @returns {Promise} A promise which resolves when the payload completes
	*/
	gulp.run = (...args) => args.reduce((chain, func) => {
		var wrapper;

		if (typeof func == 'string' && this.gulp.task(func)) { // Alias and task exists
			debug('Alias (existing task)', func);
			wrapper = ()=> Promise.resolve(this.gulp.task(func)());
			wrapper.displayName = func;
		} else if (typeof func == 'string') { // Alias and task doesn't already exist
			debug('Alias (future task)', func);
			wrapper = ()=> new Promise((resolve, reject) => {
				var attempt = 0;
				var checkExists = ()=> {
					var funcTask = this.gulp.task(func);
					if (funcTask) {
						debug('Future task alias now exists', func);
						return funcTask();
					} else if (++attempt < this.settings.futureTaskTries) {
						debug('Future task alias doesnt exist yet', func, `try #${attempt} / ${this.settings.futureTaskTries}`);
						setTimeout(checkExists, this.settings.futureTaskWait);
					} else { // Give up
						debug('Given up trying to find future task alias', func);
						reject(`Cannot find task alias "${func}" after ${this.settings.futureTaskTries} ticks waiting for a total of ${this.settings.futureTaskTries * this.settings.futureTaskTries}ms`);
					}
				};
				setTimeout(checkExists, this.settings.futureTaskWait);
			});
			wrapper.displayName = func;
		} else if (typeof func == 'function' && autopsy.identify(func) == 'async') {
			debug('Wrap async func', func);
			wrapper = ()=> func();
			wrapper.displayName = '<async func>';
		} else if (typeof func == 'function' && autopsy.identify(func) == 'plain') {
			debug('Wrap plain func', func);
			wrapper = ()=> Promise.resolve(func());
			wrapper.displayName = '<plain func>';
		} else if (typeof func == 'function' && autopsy.identify(func) == 'cb') {
			debug('Wrap callback func', func);
			wrapper = ()=> Promise.resolve(util.promisify(func)());
			wrapper.displayName = '<callback func>';
		} else if (func instanceof Promise) { // Promise
			debug('Wrap promise', func);
			wrapper = ()=> func;
			wrapper.displayName = '<already-resolved promise>';
		} else if (typeof func == 'function' || func instanceof Promise) { // Assume promise factory
			debug('Wrap misc func (probably promise)', func);
			wrapper = ()=> Promise.resolve(func());
			wrapper.displayName = '<promise factory func>';
		} else if (Array.isArray(func)) {
			wrapper = ()=> Promise.all(
				func.map(f =>
					this.gulp.run(f)
				)
			);
			wrapper.displayName = '<parallel items>';
		} else {
			debug('UNKNOWN FUNC TYPE', func);
			throw new Error(`Unknown task run type: ${typeof func}`);
		}

		var startTime = Date.now();

		wrapper.showName = args.verbose || !/^<.*>$/.test(wrapper.displayName);

		return chain
			.then(()=> wrapper.showName && this.settings.taskStart(wrapper.displayName))
			.then(wrapper)
			.then(()=> wrapper.showName && this.settings.taskEnd(wrapper.displayName, Date.now() - startTime));

	}, Promise.resolve());
	// }}}

	// Wrap gulp.parallel() / gulp.series() / gulp.start() {{{
	this.parallel = (...args) => ()=> this.gulp.run(args);
	this.series = (...args) => ()=> this.gulp.run(...args);
	gulp.start = (...args) => this.gulp.run(...args);
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
		}, 1000) // FIXME: This wait is way too long but required as some processes close off resources like DB connections before they should
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
