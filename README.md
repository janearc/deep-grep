deep-grep
=========

Too many haystacks, not enough needles &mdash; or, "when you have a grep,
everything looks like a list."

```javascript
var needles = dg.deeply( [
	foo, [
		bar, baz, [
			bletch, [
				qip
			]
		]
	] ], function (t) { if t == qip return t }
)
```

usage
====

For grep on simple, flat (non-nested) lists:

* `dg.in()`
  - `dg.in( list, 'value' )` - returns `true` or `false` depending upon
     whether `list` contains `value`.
* `dg.all_in()`
  - `dg.all_in( list_a, list_b )` - returns a list of all values in `list_a`
   that exist in `list_b`.
* `dg.unique()`
  - `dg.unique( list )` - returns all unique values of `list`. Note: flattens.
* `dg.flatten( )`
  - `dg.flatten( nested_list )` - returns a list of all the lists contained in
    `nested_list`, concatenated into a single scope.

For doing greppy things on nested lists:

```javascript
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

```javascript
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

deprecated methods
====

* `dg.sync()`
  - `dg.sync( list, expression )` - evaluates `list`, returning a new list of every
     element that matches `expression.test` (like `RegExp`).
  - `dg.sync( list, func )` - same as above, only executes `func` for every element
     of list, returning a new list.
* `dg.async()`
  - `dg.async( list, expression )` - same as with `sync()`, above, only
     returns a promise to the list of matches.
  - `dg.async( list, func, callback )` - same as `sync()`, above, except the
     callback is called with a promise to the list of matches.

author
====

[@janearc](https://github.com/janearc), jane@cpan.org
