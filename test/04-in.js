var assert  = require('assert')
	, chai    = require('chai')
	, dg = require( '../lib/dg.js' );

var input    = [ 'test', 'another test', 1234, 'a string' ];

it('in', function () {
	var r = dg.in( input, 'a string' );
	assert( r, 'returned truth' );
	var s = dg.in( input, 'peace on earth' );
	chai.assert.notOk( s, 'returned false (boo-hoo)' );
} );

it('all_in', function () {
	var r = dg.all_in( input, [ 'a string', 'test' ] );
	assert(r, 'truth returned');

	// We do not guarantee the return order of lists. Chai has this cool 'equal-ish' assert:
	//   .include(haystack, needle, [message])
	//

	r.forEach( function (test) {
		chai.assert.include( [ 'a string', 'test' ], test, 'correct values returned' );
	} );
} );
