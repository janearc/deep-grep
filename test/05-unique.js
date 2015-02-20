var entities = function () { return  [
	'Ishmael', 'Ahab', 'Starbuck', 'Queequeg', 'Stubb', 'Tashtego', 'Flask', 'Daggoo',
	'Pip', 'Fedallah', 'Peleg', 'Bildad', 'Mapple', 'Boomer', 'Gabriel'
] }

var duplicates = function () { return [ 'Ahab', 'Starbuck', 'Queequeg', 'Gabriel' ] }

var nested = function () { return [ 'Redburn', 'Jones', 'Riga', 'Jackson', 'Lavender', 'Blunt', 'Larry' ] }

var assert   = require( 'assert' )
	, chai     = require( 'chai' )
	, dg       = require( '../lib/dg.js' )

it( 'syntax', function () {
	assert( function () { return dg = require( '../lib/dg.js' ) }, 'require' );
} );

it( 'unique', function () {
	var test1 = dg.unique(entities())

	// Test that unique didn't lop off any values
	//
	assert.deepEqual( test1, entities(), 'simple uniqueness' );

	// Add in some duplicates
	//
	var entities_dupes = dg.flatten( [ entities(), duplicates() ] );

	// Check to see that unique removes the duplicates we added
	//
	var test2 = dg.unique( entities_dupes );
	assert.deepEqual( test2, entities(), 'uniqueness' );

	// Throw in some nested elements
	//
	var nested_test = [ entities(), [ duplicates() ], [ nested() ] ];

	// Create the control list
	//
	var nested_control = dg.flatten( [ entities(), nested() ] );

	// Run the test
	//
	var test3 = dg.unique( nested_test );

	assert.deepEqual( test3, nested_control, 'deep uniqueness' );
} );
