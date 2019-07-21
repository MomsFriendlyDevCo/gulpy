var exec = require('@momsfriendlydevco/exec');
var mlog = require('mocha-logger');

Object.assign(exec.defaults, {
	buffer: true,
	log: mlog.log,
	prefix: '[Gulp]',
	alias: {
		gulp: `${__dirname}/../node_modules/gulp/bin/gulp.js`,
	},
	rejectError: code => `Gulp returned exit code ${code}`,
});
