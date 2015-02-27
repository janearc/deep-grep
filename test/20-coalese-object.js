var start = function () { return {
	foo: 'foo_value',
	bar: 'bar_value',
	baz: 'baz_value'
} }

var into = function () { return {
	qip: 'qip_value',
	quux: 'quux_value'
} };

var assert   = require( 'assert' )
	, chai     = require( 'chai' )
	, dg       = require( '../lib/dg.js' )

it( 'syntax', function () {
	assert( function () { return dg = require( '../lib/dg.js' ) }, 'require' );
} );

it( 'coalesce', function () {
	var new_obj = dg.coalesce_object( start(), into(), {
		'keys':         [ 'foo', 'bar', 'baz' ],
		'return-clone': true
	} );
	var merged = {
		foo: 'foo_value',
		bar: 'bar_value',
		baz: 'baz_value',
		qip: 'qip_value',
		quux: 'quux_value'
	}
	assert( new_obj, 'truthy return' );
	assert.deepEqual( new_obj, merged, 'coalesced object' );
} );
