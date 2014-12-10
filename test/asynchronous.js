var assert = require('assert');
var dg     = require( '../lib/dg.js' );
var test   = [ 'test', 'another test', 1234, 'a string' ];

it( 'Expression (asynchronous): object returned', function () {
	dg.async( test, new RegExp( '^test$' ) ).then(
		function (r) {
			assert( typeof r, 'object' )
		}
	)
} );

it( 'Function (asynchronous): correct value returned', function () {
	dg.async( test, function (t) { if ( t == 'test' ) return 1 }, function (r) {
			assert.equal( r, [ 'test' ] )
	} ) }
);
