var expect = require('chai').expect;
var exec = require('@momsfriendlydevco/exec');
var gulp = require('gulp');
var gulpy = require('..');

describe('sequence tests', ()=> {

	before(()=> require('./setup'));

	it('should support basic task sequencing', ()=>
		exec(`gulp -f ${__dirname}/data/sequence.gulp.js basic`)
			.then(res => {
				var lines = res.split('\n').filter(l => /^-/.test(l)).map(l => l.substr(1));
				expect(lines).to.deep.equal(['start', 'a1 start', 'a1 end', 'a2 start', 'a2 end', 'a3 start', 'a3 end', 'end']);
			})
	);

	it('should support task aliases (where task is already defined)', ()=>
		exec(`gulp -f ${__dirname}/data/sequence.gulp.js alias-defined`)
			.then(res => {
				var lines = res.split('\n').filter(l => /^-/.test(l)).map(l => l.substr(1));
				expect(lines).to.deep.equal(['start', 'b1 start', 'b1 end', 'b2 start', 'b2 end', 'b3 start', 'b3 end', 'end']);
			})
	);

	it('should support task aliases (where task is defined in the future)', ()=>
		exec(`gulp -f ${__dirname}/data/sequence.gulp.js alias-future`)
			.then(res => {
				var lines = res.split('\n').filter(l => /^-/.test(l)).map(l => l.substr(1));
				expect(lines).to.deep.equal(['start', 'c1 start', 'c1 end', 'c2 start', 'c2 end', 'c3 start', 'c3 end', 'end']);
			})
	);

	it('should support all task sequences', ()=>
		exec(`gulp -f ${__dirname}/data/sequence.gulp.js all`)
			.then(res => {
				var lines = res.split('\n').filter(l => /^-/.test(l)).map(l => l.substr(1));
				expect(lines).to.deep.equal([
					'start',
					'start', 'a1 start', 'a1 end', 'a2 start', 'a2 end', 'a3 start', 'a3 end', 'end',
					'start', 'b1 start', 'b1 end', 'b2 start', 'b2 end', 'b3 start', 'b3 end', 'end',
					'start', 'c1 start', 'c1 end', 'c2 start', 'c2 end', 'c3 start', 'c3 end', 'end',
					'end',
				]);
			})
	);

});

