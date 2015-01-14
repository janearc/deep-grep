'use strict';

var assert   = require( 'assert' )
	, chai     = require( 'chai' )
	, dg

	, simple_list = function () { return [ 'foo', 'unicorn', 'bar', 'baz' ] }
	, nested_list = function () { return [ 'foo', [ 'unicorn', 'bar', [ 'leprechaun' ] ], 'baz' ] }

	, mythical    = function () { [ 'unicorn', 'leprechaun', 'griffin', 'sphinx', 'centaur', 'dragon', 'siren', 'banshee' ] }

it( 'syntax', function () {
	assert( function () { return dg = require( '../lib/dg.js' ) }, 'require' );
} );

it( 'simple list', function () {
	dg = require( '../lib/dg.js' );

	assert( function () {
		var uni = dg.sync( simple_list(), function (t) { if (t == 'unicorn') return true } );
		if (uni.length != 1) return false;
		if (uni[0] != 'unicorn') return false;
		return true;
	}, 'returns requisite element' );

} );

