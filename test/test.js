var expect = require('chai').expect;
var exec = require('@momsfriendlydevco/exec');

describe('gulpy', ()=> {

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


});

describe('gulp.task.once()', ()=> {

	it('should process simple prerequisites #1', ()=> {
		exec(`gulp -f ${__dirname}/data/once.gulp.js fooBar`, {buffer: true})
			.then(res => {
				var lines = res.split('\n').filter(l => /^Out:/.test(l));
				expect(lines).to.deep.equal(['Out:Setup', 'Out:Foo', 'Out:Bar']);
			})
			.catch(()=> expect.fail('Should not fail to run'))
	});

	it('should process simple prerequisites #2', ()=> {
		exec(`gulp -f ${__dirname}/data/once.gulp.js setupFooBar`, {buffer: true})
			.then(res => {
				var lines = res.split('\n').filter(l => /^Out:/.test(l));
				expect(lines).to.deep.equal(['Out:Setup', 'Out:Foo', 'Out:Bar']);
			})
			.catch(()=> expect.fail('Should not fail to run'))
	});

});

describe('gulpy.mutate', ()=> {
	var gulp = require('gulp');

	it('should not have mutated the original gulp instance', ()=> {
		expect(gulp.isGulpy).to.not.be.ok;
	});

	it('should be able to mutate the original gulp instance', ()=> {
		var gulpy = require('..').mutate();

		expect(gulpy.isGulpy).to.be.true;
		expect(gulp.isGulpy).to.be.true;
	});

	it('should be able to function with Gulpy syntax as Gulp when mutate is called', ()=> {
		var gulpy = require('..').mutate();

		expect(()=> {
			gulp.task('foo', 'bar');
			gulp.task('bar', ()=> {});
			gulp.task('foo')();
		}).to.not.throw;
	});

});
