var autopsy = require('@momsfriendlydevco/autopsy');
var chalk = require('chalk');
var debug = require('debug')('gulpy');
var eventer = require('@momsfriendlydevco/eventer');
var gulp = require('gulp');
var util = require('util');
var args = require('yargs').argv;

function Gulpy() {
	this.gulp = gulp; // Inherit the regular gulp instance into gulpy.gulp
	this.isGulpy = true; // Marker so we know if the original gulp instance has already been mutated
	Object.assign(this, gulp); // Act like gulp

	if (!this.gulp.task) throw new Error('Cannot find gulp.task - your gulp version is probably out of date');

	this.running = []; // Collection of tasks that are running

	this.gulp.log = this.log = (...msg) => {
		var now = new Date();
		console.log(
			'[' + this.colors.grey(('' + now.getHours()).padStart(2, '0') + ':' + ('' + now.getMinutes()).padStart(2, '0') + ':' + ('' + now.getSeconds()).padStart(2, '0') + '.' + ('' + now.getMilliseconds()).padStart(3, '0')) + ']',
			...msg
		);
	};

	this.gulp.colors = this.colors = chalk;

	this.settings = {
		futureTaskTries: 20,
		futureTaskWait: 50,
		taskStart: task => this.log(`Starting "${this.colors.cyan(task.id)}"...` + (task.preDeps ? ' ' + this.colors.grey('(' + task.preDeps.join(' > ') + ')') : '')),
		taskEnd: task => this.log(`Finished "${this.colors.cyan(task.id)}"`, this.colors.grey(`(${task.totalTime}ms)`)),
		logging: true,
		loggingeOnce: false,
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

		this.task.onceRun.add(id); // Add to once function buffers

		chain[chain.length-1] = ()=> {
			if (func.oncePromise) { // Func already running - attach to its promise and wait
				return func.oncePromise;
			} else { // Func first run
				return func.oncePromise = Promise.resolve(func());
			}
		};

		return this.task(id, ...chain);
	};


	/**
	* Storage for all TaskID's that we know run once and have already started /finished execution
	* @var {Set}
	*/
	this.task.onceRun = new Set();
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
	this.gulp.run = this.run = (...args) => args.reduce((chain, func) => {
		debug('Gulp running', args, chain);
		var wrapper;

		var meta;
		if (args.length > 0 && typeof args[0] == 'object' && args[0].meta) { // Is the first arg a meta object? Remove it from the stream
			meta = args.shift().meta;
		}

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
						reject(`Cannot find task alias "${func}" after ${this.settings.futureTaskTries} ticks (waited for a total of ${this.settings.futureTaskTries * this.settings.futureTaskTries}ms)`);
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
			wrapper = ()=> Promise.resolve(func())
				.then(res => {
					if (res && res.on) { // Is an event emitter - bind to 'end' function and wait
						debug('Wrap event-emitter output', res);
						return new Promise(resolve =>
							res.on('end', ()=> {
								debug('event-emitter ended');
								resolve(res);
							})
						);
					} else {
						return res;
					}
				})

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
					this.run(f)
				)
			);
			wrapper.displayName = '<parallel items>';
		} else {
			debug('UNKNOWN FUNC TYPE', func);
			throw new Error(`Unknown task run type: ${typeof func}`);
		}

		wrapper.showName = args.verbose || !/^<.*>$/.test(wrapper.displayName);

		var task = { // Compute what we will pass to the logger
			id: wrapper.displayName,
			startTime: Date.now(),
			totalTime: undefined, // Calculated in end step
			...meta
		};

		// Is task a once-only and has it already begun / finished
		var logTask = (wrapper.showName && this.settings.logging && this.settings.loggingOnce) // Always log
			|| (wrapper.showName && this.settings.logging && !this.task.onceRun.has(task.id)) // Basic logging + task is not marked as 'once'

		return chain
			.then(()=> this.running.push(task) == 1 && this.emit('start')) // Push task onto running stack, emit 'start' if its the first
			.then(()=> logTask && this.settings.taskStart(task))
			.then(() => debug('Tasks remaining', this.running))
			.then(()=> this.emit('taskStart', task))
			.then(wrapper)
			.then(()=> logTask && this.settings.taskEnd({...task, totalTime: Date.now() - task.startTime}))
			.then(() => debug('Removing task', this.running.find(t => t != task)))
			.then(()=> this.running.splice(this.running.findIndex(t => t != task), 1)) // Remove task from stack
			.then(()=> this.emit('taskEnd', task))
			.then(() => debug('Tasks remaining', this.running))
			.then(()=> {
				// TODO: Could we implement a timeout here?
				if (!this.running.length) {
					debug('Emitting "finish" event');
					this.emit('finish');
				}
			}) // Emit 'finish' if stack is empty

	}, Promise.resolve());
	// }}}

	// Wrap gulp.parallel() / gulp.series() / gulp.start() {{{
	this.parallel = (...args) => ()=> this.run(args);
	this.series = (...args) => ()=> this.run(...args);
	this.start = (...args) => this.run(...args);
	// }}}

	// FIXME: Why does extending in this way not result firing of "finish" events attached to instances imported with `require('gulp')`?
	eventer.extend(this);

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
