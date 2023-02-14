var expect = require('chai').expect;
var exec = require('@momsfriendlydevco/exec');
var gulp = require('gulp');
var gulpy = require('..');

describe('gulp.userTask()', ()=> {

	before(()=> require('./setup'));

	it('check that userTask correctly responds #1', ()=>
		exec(`gulp -f ${__dirname}/data/userTask.gulp.js foo`)
			.then(res => {
				var lines = res.split('\n').filter(l => /=/.test(l));
				expect(lines).to.deep.equal([
					'FOO=true',
				]);
			})
	);

	it('check that userTask correctly responds #2', ()=>
		exec(`gulp -f ${__dirname}/data/userTask.gulp.js bar`)
			.then(res => {
				var lines = res.split('\n').filter(l => /=/.test(l));
				expect(lines).to.deep.equal([
					'FOO=false',
					'BAR=true',
				]);
			})
	);

	it('check that userTask correctly responds #3', ()=>
		exec(`gulp -f ${__dirname}/data/userTask.gulp.js bar baz`)
			.then(res => {
				var lines = res.split('\n').filter(l => /=/.test(l));
				expect(lines).to.deep.equal([
					'FOO=false',
					'FOO=false',
					'BAR=true',
					'BAR=true',
					'BAZ=true',
				]);
			})
	);


});
