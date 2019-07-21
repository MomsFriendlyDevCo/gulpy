var expect = require('chai').expect;
var exec = require('@momsfriendlydevco/exec');
var gulp = require('gulp');
var gulpy = require('..');

describe('gulp.task.once()', ()=> {

	before(()=> require('./setup'));

	it('should process simple prerequisites #1', ()=> {
		exec(`gulp -f ${__dirname}/data/once.gulp.js fooBar`)
			.then(res => {
				var lines = res.split('\n').filter(l => /^Out:/.test(l));
				expect(lines).to.deep.equal(['Out:Setup', 'Out:Foo', 'Out:Bar']);
			})
	});

	it('should process simple prerequisites #2', ()=> {
		exec(`gulp -f ${__dirname}/data/once.gulp.js setupFooBar`)
			.then(res => {
				var lines = res.split('\n').filter(l => /^Out:/.test(l));
				expect(lines).to.deep.equal(['Out:Setup', 'Out:Foo', 'Out:Bar']);
			})
	});

});
