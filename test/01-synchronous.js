var assert = require('assert');
var dg     = require( '../lib/dg.js' );

var input    = [ 'test', 'another test', 1234, 'a string' ]
	, results = [ ];

it('Expression (synchronous): object returned', function () {
	var r = dg.sync( input, /^test$/ );
	assert.equal( typeof r, 'object' )
} );

it('Expression (synchronous): correct value returned', function () {
	assert.deepEqual( dg.sync( input, new RegExp( '^test$' ) ) , [ 'test' ] )
} );

it('Function (synchronous): object returned', function () {
	var r = dg.sync( input, function (t) { if ( t == 'test' ) { return 1 } } );
	assert( (typeof r) ==  'object', 'object returned' )
} );

it('Function (synchronous): correct value returned', function () {
	assert.deepEqual( dg.sync( input, function (t) { if (t === 'test') { return 1 } } ) , [ 'test' ] )
} );
