var expect = require('chai').expect;
var exec = require('@momsfriendlydevco/exec');
var gulp = require('gulp');
var gulpy = require('..');

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

