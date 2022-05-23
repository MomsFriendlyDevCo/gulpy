@MomsFriendlyDevCo/Gulpy
========================
Like [Gulp](https://gulpjs.com) but with a few extras.

This module fixes a few irritations with the new Gulp 4 standard and makes some gulp task definitions easier to read.

The intention here is to remain as-close-as-possible to the actual Gulp release while still supporting some of the nicer syntax (IMHO) of Gulp@3.


Why?
----

* **Call-forwards** - Like any company with a large sprawling codebase we separate our gulp files up into multiple chunks and sometimes things like calling between these gulp tasks is required. The Gulp@4 standard doesn't really seem to take this into account so the `gulp.task(id, func)` invocation has to be called in an exact order or you get an error. This can be fixed with [some workarounds](https://github.com/gulpjs/undertaker-forward-reference) but even the official Gulp docs say this is likely to be abandoned at some future point.
* **Non-Async functions** - I honestly see no earthly reason why Gulp@4 now insists that all functions should be async except as an aesthetic choice. Forgetting to add the magical `async` bit before a function when it just returns an inline operation seems extremely arbitrary.
* **Task prerequisites** - Yes I know you can use `gulp.task(id, gulp.series(foo, bar, baz))` to show the execution order but if the last one of these is a function things get messy. I much prefer the `gulp.task(id, [prereqs...], func)` way of doing things
* **Run-once tasks** - An easier way to specify that a task should be executed only once, even if called multiple times as a pre-requisite.
* **Emit "finish" event for cleanup** - I've honestly no idea how [cleaning up after multiple tasks is not a problem to solve](https://github.com/gulpjs/gulp/issues/1275) but disconnecting from the database and so on should be handled properly
* **Tidier task display** - Automatically hides all weird "Parallel", "Series" anonymous tasks unless `--verbose` is specified


Installation & Usage
--------------------
This module works as a mixin of Gulp. Set your `gulp` instance to it to inherit regular Gulp behaviour as well as the extra features and fixes of this module.

1. Simply install the NPM

```
npm install @momsfriendlydevco/gulpy
```


2. And include at the top of your main gulpfile where you would normally reference `gulp`:

```javascript
var gulp = require('@momsfriendlydevoco/gulpy');

gulp.task(id, func); // etc...
```


Debugging
---------
This module uses the [Debug NPM package](https://github.com/visionmedia/debug#readme) and responds to `gulpy`.

To see verbose debugging output simply set `DEBUG=gulpy` or any valid glob expression.

```
> DEBUG=gulpy gulp taskID
```


Features
========


Call-forwards
-------------
Calling a task that hasn't been defined yet is now wrapped in a function which defers until a later point.


```javascript
var gulp = require('@momsfriendlydevco/gulpy');

gulp.task('foo', gulp.series('bar', async ()=> console.log('Out:Foo')));
gulp.task('bar', gulp.series('baz', async ()=> console.log('Out:Bar')));
gulp.task('baz', async ()=> console.log('Out:Baz'));
```

This is also possible with the [undertaker-forward-reference](https://github.com/gulpjs/undertaker-forward-reference) registry but the author has no intention to keep that up-to-date.


Non-async functions
-------------------
No idea why Gulp@4 demands this but if you declare a Gulp task without the magical `async` it will now be wrapped in a promise on your behalf.


```javascript
var gulp = require('@momsfriendlydevco/gulpy');

gulp.task('foo', gulp.series('bar', ()=> console.log('Out:Foo')));
gulp.task('bar', gulp.series('baz', ()=> console.log('Out:Bar')));
gulp.task('baz', ()=> console.log('Out:Baz'));
```


Task chaining
-------------
Easily specify task-prerequisites and execution order.


```javascript
var gulp = require('@momsfriendlydevco/gulpy');

gulp.task('default', ['foo']);
gulp.task('foo', 'bar', ()=> console.log('Out:Foo'));
gulp.task('bar', ['baz'], ()=> console.log('Out:Bar'));
gulp.task('baz', 'baz:real');
gulp.task('baz:real', ()=> console.log('Out:Baz'));
```



| Gulpy shorthand                       | Gulp@4 equivalent                                 | Description                                             |
|---------------------------------------|---------------------------------------------------|---------------------------------------------------------|
| `gulp.task(id, func)`                 | `gulp.task(id, func)`                             | Standard `gulp.task()` usage                            |
| `gulp.task(id, 'foo')`                | `gulp.task(id, gulp.series('foo'))`               | Redirect a task to another                              |
| `gulp.task(id, 'foo', 'bar')`         | `gulp.task(id, gulp.series('foo', 'bar'))`        | Set up a chain of tasks to be run in series by their ID |
| `gulp.task(id, ['foo', 'bar'], func)` | `gulp.task(id, gulp.series('foo', 'bar'', func))` | Run a task with prerequisites                           |



Run-once
--------
To specify that a task should be run only once during the life of the Gulp process simply suffix each `.task` call with `.once`:

```javascript
gulp.task.once('setup', ()=> ...);
gulp.task('foo', ['setup'], ()=> ...);
gulp.task('bar', ['setup'], ()=> ...);
gulp.task('build', ['foo', 'bar']); // 'setup' runs only once, followed by 'foo', 'bar', in parallel
```


Event management
----------------
Gulpy uses [eventer](https://github.com/MomsFriendlyDevCo/eventer) to manage promisable events at each stage of the lifecycle.

```javascript
gulp.on('finish', ()=> ...)
```

Supported events are:

| Event       | Args     | Description                                                                 |
|-------------|----------|-----------------------------------------------------------------------------|
| `start`     | `()`     | Emitted on the very first task (or when the task buffer is empty)           |
| `taskStart` | `(task)` | Emitted at the start of each new task with the task object                  |
| `taskEnd`   | `(task)` | Emitted at the end of a task with the task object                           |
| `finish`    | `()`     | Emitted at the very end of the task stack (or when the task buffer empties) |


API
===
This module is a mixin to Gulp which extends some existing Gulp functions to work with the features listed above.
It also provides the following extra functionality in addition to the standard Gulp API.


gulpy.isGulpy
-------------
Always true, this can be used as a check to see if `gulpy.mutate()` has been called. If it has then `gulp.isGulpy` will also be true.


gulpy.log(...msgs)
------------------
Log output using the same style used when rendering task start / ends.


gulpy.colors
------------
[Chalk](https://github.com/chalk/chalk) instance.


gulpy.mutate()
--------------
Overwrite the gulpy mutated functions in the `gulp`, effectively turning every `require('gulp')` call into `require('@momsfriendlydevco/gulpy')`.
Only use this if you know what you are doing as this may have side-effects with downstream modules.


gulpy.run(...tasks)
-------------------
Inline replacement for `gulp.series()` and `gulp.parallel()`.
This funciton is used to process all arguments after the task alias in `gulp.task()`

This function can take any number of the following arguments:

* (string) already declared tasks
* (string) future tasks (i.e. not yet present)
* Async functions
* Promises + Promise factories
* Callback functions
* Plain functions
* Array of any of the above (child items executed in parallel)
* An event-emitter (include Gulp / Vinyl chains) - if an `.on()` function is found we wait for `end` to be signalled before continuing


```javascript
// Run 'Foo' then 'Bar', then 'Baz'
gulp.run('foo', 'bar', 'baz');

// Run 'Foo' then 'Bar' + 'Baz' (the latter two in parallel
gulp.run('foo', ['bar', 'baz']);

// Declare a task 'foo' which runs 'bar' then 'baz' + 'quz' in parallel
gulp.task('foo', 'bar', ['baz', 'quz']);
```


gulpy.start(...tasks)
---------------------
Alias of `gulp.run()`


gulpy.settings
--------------
Object of settings used by Gulpy.

Available options:

| Setting             | Type     | Default   | Description                                                                            |
|---------------------|----------|-----------|----------------------------------------------------------------------------------------|
| `futureTaskTries`   | Number   | `20`      | How many tries before giving up on finding a future task alias as-yet-to-be-declared   |
| `futureTaskWait`    | Number   | `50`      | The millisecond wait between each future task alias attempt                            |
| `logging`           | Boolean  | `true`    | Whether to call any of the log functions when running tasks                            |
| `loggingOnce`       | Boolean  | `false`   | Whether to log any tasks marked as `.once()`, these are off by default as they are typically utility functions |
| `taskStart`         | Function | See code  | Called as `(task)` when a task starts, override to change logging                      |
| `taskEnd`           | Function | See code  | Called as `(task)` when a task ends, override to change logging                        |




gulpy.gulp
----------
The original gulp instance if raw access is required.
