'use strict';

var assert = require('assert');
var dg     = require( '../lib/dg.js' );

// inspired by a Real Actual Bug(tm)
//
var user_records    = [
		{ 'user-name': 'jane' }
	, { 'user-name': 'kate' }
	, { 'user-name': 'may' }
	, { 'user-name': 'alouicious everdander evercromby' }
	, { 'user-name': 'mud' }
	, { 'user-name': 'tybalt' }
	, { 'user-name': 'chakotay' }
];

it('find a username in a hash', function () {
	var r = dg.deeply(
		user_records,
		function (t) { if (t == 'tybalt') return true },
		{
			'return-hash-tuples': true,
			'check-keys': false,
			'check-values': true
		}
	);
	assert.equal( r, { 'user-name': 'tybalt' } )
} );

// jane@cpan.org // vim:tw=80:ts=2:noet
