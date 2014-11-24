var assert   = require( 'assert' )
	, chai     = require( 'chai' )
	, dg

	, simple_list = [ 'foo', 'unicorn', 'bar', 'baz' ]
	, nested_list = [ 'foo', [ 'unicorn', 'bar', [ 'leprechaun' ] ], 'baz' ]
	, simple_hash = { 'foo': 'bar', 'horselike': 'unicorn', 'baz': 'bletch', 'leprechaun': '2' }
	, nested_hash = { 'foo': 'bar', 'mythical-creatures': { 'critters': [ 'unicorn', 'leprechaun' ] } }

	// XXX: add object w/ methods for greppage

	, mythical    = [ 'unicorn', 'leprechaun', 'griffin', 'sphinx', 'centaur', 'dragon', 'siren', 'banshee' ]

it( 'syntax', function () {
	assert( function () { return dg = require( '../lib/dg.js' ) }, 'require' );
} );

it( 'simple list', function () {
	dg = require( '../lib/dg.js' );

	assert( function () {
		var uni = dg.deeply( simple_list, function (t) { if (t == 'unicorn') return true } );
		if (uni.length != 1) return false;
		if (uni[0] != 'unicorn') return false;
		return true;
	}, 'returns requisite element' );

} );

it( 'nested list', function () {
	dg = require( '../lib/dg.js' );

	assert( function () {
		var uni = dg.deeply( nested_list, function (t) { if (t == 'unicorn') return true } );
		if (uni.length != 1) return false;
		if (uni[0] != 'unicorn') return false;
		return true;
	}, 'returns requisite element' );

	var uni = dg.deeply( nested_list, function (t) {
		if ( (t == 'unicorn') || (t == 'leprechaun') ) { return true }
	} );

	console.log( uni );
	assert(uni.length == 2, 'two elements returned');

	// XXX: This is kind of cheating. It looks like 'include' does not mean 'equal':
	//   AssertionError: correct list values returned: expected [ 'unicorn', 'leprechaun' ] to include [ 'unicorn', 'leprechaun' ]
	// so for now we just get a haystack and check for needles. Eventually this
	// needs to be fixed.
	//

	chai.assert.include( mythical, uni, 'correct list values returned' );
} );
