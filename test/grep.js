var assert   = require( 'assert' )
	, chai     = require( 'chai' )
	, dg


it( 'syntax', function () {
	assert( function () { return dg = require( '../lib/dg.js' ) }, 'require' );
} );
