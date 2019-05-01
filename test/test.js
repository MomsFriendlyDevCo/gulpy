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

	it.skip('should support non-async functions', ()=>
		exec(`gulp -f ${__dirname}/data/nonAsync.gulp.js foo`, {buffer: true})
			.then(res => {
				var lines = res.split('\n').filter(l => /^Out:/.test(l));
				expect(lines).to.deep.equal(['Out:Baz', 'Out:Foo', 'Out:Bar']);
			})
			.catch(()=> expect.fail('Should not fail to run'))
	);

});
