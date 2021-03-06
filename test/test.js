var expect = require('chai').expect;
var exec = require('@momsfriendlydevco/exec');
var gulp = require('gulp');
var gulpy = require('..');

describe('gulpy', ()=> {

	before(()=> require('./setup'));

	it('should look like the main gulp module', ()=> {
		var excludeMethods = ['isGulpy', 'colors', 'emit', 'gulp', 'log', 'mutate', 'off', 'on', 'once', 'run', 'running', 'settings', 'start', 'wrapFuncs'];

		expect(Object.keys(gulpy).sort().filter(m => !excludeMethods.includes(m))).to.be.deep.equal(Object.keys(gulp).sort().filter(m => !excludeMethods.includes(m)));
	});

	it('should work with a standard gulpfile', ()=>
		exec(`gulp -f ${__dirname}/data/standard.gulp.js baz`)
			.then(res => {
				var lines = res.split('\n').filter(l => /^Out:/.test(l));
				expect(lines).to.deep.equal(['Out:Foo', 'Out:Bar', 'Out:Baz']);
			})
	);

	it('should support call-forwards', ()=>
		exec(`gulp -f ${__dirname}/data/callForward.gulp.js foo`)
			.then(res => {
				var lines = res.split('\n').filter(l => /^Out:/.test(l));
				expect(lines).to.deep.equal(['Out:Baz', 'Out:Bar', 'Out:Foo']);
			})
	);

	it('should support non-async functions', ()=>
		exec(`gulp -f ${__dirname}/data/nonAsync.gulp.js foo`)
			.then(res => {
				var lines = res.split('\n').filter(l => /^Out:/.test(l));
				expect(lines).to.deep.equal(['Out:Baz', 'Out:Bar', 'Out:Foo']);
			})
	);

	it('should support chained task declarations', ()=>
		exec(`gulp -f ${__dirname}/data/chain.gulp.js`)
			.then(res => {
				var lines = res.split('\n').filter(l => /^Out:/.test(l));
				expect(lines).to.deep.equal(['Out:Baz', 'Out:Bar', 'Out:Foo']);
			})
	);

});
