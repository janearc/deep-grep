deep-grep
=========

Too many haystacks, not enough needles &mdash; or, "when you have a grep,
everything looks like a list."

```
var needles = dg.deeply( [
	foo. [
		bar, baz, [
			bletch, [
				qip
			]
		]
	] ], function (t) { if t == qip return t }
)
```

Inspired by this, which I wrote for [Sendak](https://github.com/18F/Sendak):

```
  var jgrep    = require( 'jagrep' )
    , fs       = require( 'fs' )
    , cwd      = process.cwd()
    , bindir   = cwd + '/bin'
    , files = jgrep.sync( { 'function': function (f) { return is_dir(f) } },
        fs.readdirSync( bindir ).map( function (bf) {
          return fs.realpathSync(bindir + '/' + bf) 
        }
      ) ).map( function (ld) { return fs.readdirSync( ld ).map( function (f) { return ld + '/' + f } ) 
    } );
```

Usage
====

For simple lists (that is, lists with nested lists of arbitrary depth but no
complex datatypes &mdash; like objects &mdash; and no hashes), `dg.deeply` is
invoked simply:

```
var haystack = [
	'zebra', 'lion', [
		'tiger', 'unicorn', 'emperor penguin'
	],
	'leprechaun',
	'cockerel'
];

var needles  = dg.deeply( list, function (t) {
	if (new RegExp( ('(unicorn|leprechaun)s?' ).test(t))) return true
} );
```

For more complex data, options are available to you:

```
var needles  = dg.deeply( arks['Noah'], function (t) { ... }, {
	// Any of these may be defined
	//

	// If items in the provided object have methods, check these methods for
	// return values that evaluate as true in the provided function.
	//
	'check-object-methods': [ 'get_species', 'list_passengers' ],

	// Provide optionally as argument to calls from check-object-methods, above
	//
	'object-method-arguments': [ argument, function, 'etc' ],

	// Return hash keys that evaluate true also?
	//   default: false
	//
	'check-keys': true,

	// Return hash values that evaluate true?
	//   default: false
	//
	'check-values': true,

	// Return key/value tuples rather than just keys or just values?
	//   default: false
	//
	'return-hash-tuples': true,
	} );
```

Author
====

[@avriette](https://github.com/avriette), jane@cpan.org
