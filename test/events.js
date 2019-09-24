var expect = require('chai').expect;
var exec = require('@momsfriendlydevco/exec');
var gulp = require('gulp');
var gulpy = require('..');

describe('gulpy events', ()=> {

	require('./setup');

	it('should emit events during the sequence', ()=>
		exec(`gulp -f ${__dirname}/data/events.gulp.js`)
			.then(res => {
				var lines = res.split('\n').filter(l => /^(Out|Event):/.test(l));
				expect(lines).to.deep.equal([
					'Event:Start',
					'Event:taskStart foo',
					'Event:taskStart bar',
					'Event:taskStart baz',
					'Event:taskStart baz:real',
					'Out:Baz',
					'Event:taskEnd baz:real',
					'Event:taskEnd baz',
					'Event:taskStart <plain func>',
					'Out:Bar',
					'Event:taskEnd <plain func>',
					'Event:taskEnd bar',
					'Event:taskStart <plain func>',
					'Out:Foo',
					'Event:taskEnd <plain func>',
					'Event:taskEnd foo',
					'Event:Finish',
				]);
			})
	);

});
