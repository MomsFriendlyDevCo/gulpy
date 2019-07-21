var expect = require('chai').expect;
var exec = require('@momsfriendlydevco/exec');
var gulp = require('gulp');
var gulpy = require('..');

describe('gulpy', ()=> {

	before(()=> require('./setup'));

	it('should look like the main gulp module', ()=> {
		var excludeMethods = ['isGulpy', 'emit', 'gulp', 'mutate', 'off', 'on', 'once', 'start', 'wrapFuncs'];

		expect(Object.keys(gulpy).sort().filter(m => !excludeMethods.includes(m))).to.be.deep.equal(Object.keys(gulp).sort());
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
				expect(lines).to.deep.equal(['Out:Baz', 'Out:Foo', 'Out:Bar']);
			})
	);

	it('should support non-async functions', ()=>
		exec(`gulp -f ${__dirname}/data/nonAsync.gulp.js foo`)
			.then(res => {
				var lines = res.split('\n').filter(l => /^Out:/.test(l));
				expect(lines).to.deep.equal(['Out:Baz', 'Out:Foo', 'Out:Bar']);
			})
	);

	it('should support chained task declarations', ()=>
		exec(`gulp -f ${__dirname}/data/chain.gulp.js`)
			.then(res => {
				var lines = res.split('\n').filter(l => /^Out:/.test(l));
				expect(lines).to.deep.equal(['Out:Baz', 'Out:Foo', 'Out:Bar']);
			})
	);

	it('should emit the "finish" event when all done', ()=>
		exec(`gulp -f ${__dirname}/data/event-finish.gulp.js`)
			.then(res => {
				var lines = res.split('\n').filter(l => /^Out:/.test(l));
				expect(lines).to.deep.equal(['Out:Baz', 'Out:Foo', 'Out:Bar', 'Out:Finish']);
			})
	);

});
