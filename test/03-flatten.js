var sendak_data = [
  [ '/Users/jane/dev/sendak/bin/js/add-github-project.js',
    '/Users/jane/dev/sendak/bin/js/build-node.js',
    '/Users/jane/dev/sendak/bin/js/check-user.js',
    '/Users/jane/dev/sendak/bin/js/create-iam-group.js',
    '/Users/jane/dev/sendak/bin/js/create-iam-user.js',
    '/Users/jane/dev/sendak/bin/js/create-sendak-group.js',
    '/Users/jane/dev/sendak/bin/js/create-sendak-project.js',
    '/Users/jane/dev/sendak/bin/js/create-sendak-user.js',
    '/Users/jane/dev/sendak/bin/js/list-iam-group-policies.js',
    '/Users/jane/dev/sendak/bin/js/list-iam-groups.js',
    '/Users/jane/dev/sendak/bin/js/list-iam-users.js',
    '/Users/jane/dev/sendak/bin/js/list-sendak-nodes.js',
    '/Users/jane/dev/sendak/bin/js/list-sendak-users.js',
    '/Users/jane/dev/sendak/bin/js/rrm.js' ],
  [ '/Users/jane/dev/sendak/bin/pl/de64',
    '/Users/jane/dev/sendak/bin/pl/de64.pl',
    '/Users/jane/dev/sendak/bin/pl/en64',
    '/Users/jane/dev/sendak/bin/pl/en64.pl' ]
];

var assert   = require( 'assert' )
	, chai     = require( 'chai' )
	, dg       = require( '../lib/dg.js' )

it( 'syntax', function () {
	assert( function () { return dg = require( '../lib/dg.js' ) }, 'require' );
} );

it( 'flatten', function () {
	var flats = dg.flatten( sendak_data );
	assert( flats, 'return looks trueish' );
	assert( flats.length == 18, 'flattened list has right number of elements' );
} );
