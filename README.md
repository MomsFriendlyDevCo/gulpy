@MomsFriendlyDevCo/Gulpy
========================
Like [Gulp](https://gulpjs.com) but with a few extras.

This module fixes a few irritations with the new Gulp 4 standard and makes some gulp task definitions easier to read.


Why?
----

* **Call-forwards** - Like any company with a large sprawling codebase we separate our gulp files up into multiple chunks and sometimes things like calling between these gulp tasks is required. The Gulp@4 standard doesn't really seem to take this into account so the `gulp.task(id, func)` invocation has to been called in an exact order or you get an error. This can be fixed with [some workarounds](https://github.com/gulpjs/undertaker-forward-reference) but even the official Gulp docs say this is likely to be abandoned at some future point.
* **Non-Async functions** - I honestly see no earthly reason why Gulp@4 now insists that all functions should be async except as an aesthetic choice. Forgetting to add the magical `async` bit before a function when it just returns an inline operation seems extremely arbitrary.


Installation & Usage
--------------------

1. Simply install the NPM

```
npm install @momsfriendlydevco/gulpy
```


2. And include at the top of your main gulpfile:

```javascript
var gulp = require('gulp');
require('@momsfriendlydevoco/gulpy');

// ...
```


... Alternatively, Gulpy also returns the main gulp instance so if you like you can just import it all at once with:

```javascript
var gulp = require('@momsfriendlydevoco/gulpy');

// ...
```


Features
========


Call-forwards
-------------
Calling a task that hasn't been defined yet is now wrapped in a function which defers until a later point.


```javascript
var gulp = require('gulp');
require('@momsfriendlydevco/gulpy');

gulp.task('foo', gulp.series('bar', async ()=> console.log('Out:Foo')));
gulp.task('bar', gulp.series('baz', async ()=> console.log('Out:Bar')));
gulp.task('baz', async ()=> console.log('Out:Baz'));
```

This is also possible with the [undertaker-forward-reference](https://github.com/gulpjs/undertaker-forward-reference) registry but the author has no intention to keep that up-to-date.


Non-async functions
-------------------
No idea why Gulp@4 demands this but if you declare a Gulp task without the magical `async` it will now be wrapped in a promise on your behalf.


```javascript
var gulp = require('gulp');
require('@momsfriendlydevco/gulpy');

gulp.task('foo', gulp.series('bar', ()=> console.log('Out:Foo')));
gulp.task('bar', gulp.series('baz', ()=> console.log('Out:Bar')));
gulp.task('baz', ()=> console.log('Out:Baz'));
```
