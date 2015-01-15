'use strict';

var assert   = require( 'assert' )
	, chai     = require( 'chai' )
	, dg       = require( '../lib/dg' )

	, nested_list = function () { return [ 'foo', [ 'unicorn', 'bar', [ 'leprechaun' ] ], 'baz' ] }

	, mythical    = function () { [ 'unicorn', 'leprechaun', 'griffin', 'sphinx', 'centaur', 'dragon', 'siren', 'banshee' ] }

it( 'nested list', function () {

	assert( function () {
		var uni = dg.deeply(
			nested_list(),
			function (t) { if (t == 'unicorn') return true }
		);
		if (uni.length != 1)     { return false; }
		if (uni[0] != 'unicorn') { return false; }
		return true;
	}, 'returns requisite element' );

	var test = function (t) {
		if ( (t == 'unicorn') || (t == 'leprechaun') ) {
			return true;
		}
		return false;
	}

	var pair = dg.deeply( nested_list(), test );

	assert(pair.length == 2, 'two elements returned');

} );
