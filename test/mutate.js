var expect = require('chai').expect;
var exec = require('@momsfriendlydevco/exec');
var gulp = require('gulp');
var gulpy = require('..');

describe('gulpy.mutate()', ()=> {

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
