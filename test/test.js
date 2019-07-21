var expect = require('chai').expect;
var exec = require('@momsfriendlydevco/exec');
var gulp = require('gulp');
var gulpy = require('..');

describe('gulpy', ()=> {

	it('should look like the main gulp module', ()=> {
		var excludeMethods = ['isGulpy', 'emit', 'gulp', 'mutate', 'off', 'on', 'once', 'start', 'wrapFuncs'];

		expect(Object.keys(gulpy).sort().filter(m => !excludeMethods.includes(m))).to.be.deep.equal(Object.keys(gulp).sort());
	});

	it('should work with a standard gulpfile', ()=>
		exec(`gulp -f ${__dirname}/data/standard.gulp.js baz`, {buffer: true})
			.then(res => {
				var lines = res.split('\n').filter(l => /^Out:/.test(l));
				expect(lines).to.deep.equal(['Out:Foo', 'Out:Bar', 'Out:Baz']);
			})
			.catch(()=> expect.fail('Should not fail to run'))
	);

	it('should support call-forwards', ()=>
		exec(`gulp -f ${__dirname}/data/callForward.gulp.js foo`, {buffer: true})
			.then(res => {
				var lines = res.split('\n').filter(l => /^Out:/.test(l));
				expect(lines).to.deep.equal(['Out:Baz', 'Out:Foo', 'Out:Bar']);
			})
			.catch(()=> expect.fail('Should not fail to run'))
	);

	it('should support non-async functions', ()=>
		exec(`gulp -f ${__dirname}/data/nonAsync.gulp.js foo`, {buffer: true})
			.then(res => {
				var lines = res.split('\n').filter(l => /^Out:/.test(l));
				expect(lines).to.deep.equal(['Out:Baz', 'Out:Foo', 'Out:Bar']);
			})
			.catch(()=> expect.fail('Should not fail to run'))
	);

	it('should support chained task declarations', ()=>
		exec(`gulp -f ${__dirname}/data/chain.gulp.js`, {buffer: true})
			.then(res => {
				var lines = res.split('\n').filter(l => /^Out:/.test(l));
				expect(lines).to.deep.equal(['Out:Baz', 'Out:Foo', 'Out:Bar']);
			})
			.catch(()=> expect.fail('Should not fail to run'))
	);

	it('should emit the "finish" event when all done', ()=>
		exec(`gulp -f ${__dirname}/data/event-finish.gulp.js`, {buffer: true})
			.then(res => {
				var lines = res.split('\n').filter(l => /^Out:/.test(l));
				expect(lines).to.deep.equal(['Out:Baz', 'Out:Foo', 'Out:Bar', 'Out:Finish']);
			})
			.catch(()=> expect.fail('Should not fail to run'))
	);

});
