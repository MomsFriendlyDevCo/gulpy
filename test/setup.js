var exec = require('@momsfriendlydevco/exec');
var mlog = require('mocha-logger');

Object.assign(exec.defaults, {
	buffer: true,
	alias: {
		gulp: `${__dirname}/../node_modules/gulp/bin/gulp.js`,
	},
	rejectError: code => `Gulp returned exit code ${code}`,

	// Enable the following for debugging
	// log: mlog.log,
	// prefix: '[Gulp]',
});
