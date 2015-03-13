/**
 * @file deep grep
 * @author Jane Arc <jane@cpan.org>
 *
 *  @overview if you're like me, you like data structures and you don't mind
 *  them being nested to various levels and of various types.
 *
 *  sometimes, though, when you want something deep in one of these
 *  structures, it can be a pain in the ass to ask it for something deeply-
 *  nested.
 *
 *  sometimes you just want the things and you don't want to have
 *  to describe your data structure or nested object methods in excruciating
 *  detail to go and find them.
 *
 *  also i get sick of the amount of nested scoping node does, and this
 *  allows me to abstract some of that away into a lib.
 *
 *  @example
 *    var haystack = [ foo, [ bar, baz, [ bletch, [ qip ] ] ] ];
 *    var needles  = dg.deeply( haystack, function (t) {
 *      if (t == qip) { return true }
 *    } );
 */

'use strict';

/**
 * @description Perform a search through an arbitrarily-nested/complex data structure.
 *
 * @param {Array} deep the "target" list to search through; may be nested/contain complex data
 * @param {Function|RegExp} test a function or regular expression to evaluate items in list
 * @param {Object} parameters various configuration options for the operation
 * @param {Boolean} parameters.check-object-methods evalute object method return values
 * @param {Boolean} parameters.object-method-arguments parameters to pass object methods
 * @param {Boolean} parameters.check-keys check object keys
 * @param {Boolean} parameters.check-values check object values
 * @param {Boolean} parameters.return-hash-tuples return tuples instead of keys or values
 * @param {Boolean} parameters.return-promise return a promise to the results instead of a list.
 * @param {Object} session for concurrency, a session object may be supplied
 *
 * @returns {Array|Promise} an promised array of objects with the requested fields/members.
 *
 * @example
 *   // finding a user in a big list of users
 *   //
 *   var user = dg.deeply( list_with_nested_hashes, function (t) {
 *     if (t == username) { return true }
 *   }, { 'return-hash-tuples': true, 'check-keys': true, 'check-values': false } )
 *
 */
function deeply (deep, test, parameters, session) { // {{{
	var xact;

	// Attempt to discern whether we are running multiple deeply() sessions,
	// if we are, check to see that we have a session object. If not, create
	// a new session transparently to the caller.
	//
	if (session) {
		xact = session;
	}
	else {
		xact = singlesession();
		if (!xact) {
			return logwrap.error( 'Please provide a session object if you are going to run multiple deeply() sessions.' );
		}
	}

	var g = heap.sessions[ xact.serial ];

	for (; function (t) {
		if (g.deep.length > 0) {

			// Indicate we have made a first pass through deep
			//
			g.fresh = false;

			var element = g.deep.shift();
			logwrap.debug( 'Shifted sdeep, '.concat( g.deep.length, ' elements remain.' ) );

			// Handle arrays, break if this is something to explode and handle
			// later.
			//
			if (arrayhandler( element, xact )) { return true }

			// Inspect hashlike elements
			//
			if ((typeof element == 'object') && (Object.keys( element ).length > 0)) {
				// Looks like it's a hashlike thingie. Check our parameters, behave
				// accordingly.
				//
				Object.keys( element ).forEach( function (key) {
					var matched = false;
					var match   = undefined;
					if (parameters['check-keys']) {
						if (testwrapper(test, key)) {
							matched = true;
							match   = key;
						}
					}
					if (parameters['check-values']) {
						if (testwrapper(test, element[key])) {
							matched = true;
							match   = element[key];
						}
					}
					if (matched == true) {
						if (parameters['return-hash-tuples']) {
							match = element;
						}
						logwrap.debug( 'Found a hashlike match.' );
						g.results.push( match );
					}
					else {
						logwrap.debug( 'Discarded a hashlike match.' );
					}
				} );
			}

			if (testwrapper(test, element)) {
				logwrap.debug( 'Test accepted ' , element );
				g.results.push( element )
			}
			else {
				logwrap.debug( 'Test rejected ' , element );
			}
		}
		else {
			if (g.fresh == true) {
				// g.deep is fresh, let's add some values to it
				//
				g.deep.push( deep );
				return true;
			}
			else {
				// g.deep.length is false because it's exhausted
				//
				logwrap.debug( 'Finished deeply().' );
				xit.end( xact );
				delete heap.sessions[ xact.serial ];
				return false;
			}
		}
		return true;
	}( test ); ) { } // for

	return g.results;
} // }}}

/**
 * @description Flatten the nested elements of a list into a single scope
 *
 * @param {Array} deep the "target" list to flatten; may be nested/contain complex data
 *
 * @returns {Array} a "flattened" array containing the elements in deep
 */
function flatten (list, behavior) { // {{{
	var flat  = [ ]
		, local = list;

	// Rather than recurse through ourselves over and over, we are going to
	// invoke 'for' here in a possibly-rude way, basically as a 'while' with
	// a break, and just explode everything in list that is also a list back
	// onto the stack (local), and continue to walk it until it is extinguished.
	//
	for (; local.length; ) {
		var element = local.shift();

		// So reference the 'complex data' documentation here:
		//
		//   https://github.com/janearc/deep-grep/blob/master/README.md#usage
		//
		// the 'behavior' hash, above, will determine what we actually do
		// during the flatten operation. For the moment (<= 0.0.2), it is unused
		// and lists are assumed.
		//

		// This is very suspicious but when I change it to typeof, it breaks, and
		// I CBA to figure out what is wrong with it right now.
		//
		if ( Object.prototype.toString.call( element ).substr(8, 5) === 'Array' ) {
			element.forEach( function (subelement) { local.push( subelement ) } );
		}
		else {
			flat.push( element );
		}
	}

	return flat;

} // }}}

/**
 * @description Return the unique elements of a (optionally nested) list
 *
 * @param {Array} deep the "target" list; may be nested/contain complex data
 *
 * @returns {Array} a list of the unique elements in deep
 */
function unique (list) { // {{{
	var flist  = flatten( list )
		, utable = { }
	
	flist.forEach( function (k) { if (utable[k]) { utable[k]++ } else { utable[k] = 1 } } );

	return Object.keys( utable );
} // }}}

// Perform a synchronous (no-promise, blocking) grep
//
function sync (list, expression) { // {{{
	var retval = [ ];
	if ((typeof expression) == 'object') {
		// Looks like they sent us an object. Verify it has test()
		//
		if (expression.test && ((typeof expression.test) == 'function')) {
			// We allow them to send us any object that can test. We call this
			// polymorphism. It's a good thing.
			//
			retval = list.filter( function (t) {
				// Without the wrapper above, we get:
				//
				//   TypeError: Method RegExp.prototype.test called on incompatible receiver undefined
				//
				// which is .. it seems to be an error in their library. There's
				// implicit coercion to strings with the passed function wrapper
				//
				return expression.test(t);
			} );
			return retval;
		}
	}
	else if ((typeof expression) == 'function') {
		retval = list.filter( expression );
		return retval;
	}
	else {
		return logwrap.error( 'Unclear what '.concat( expression, ' is.' ) );
	}
} // }}}

// Perform an asynchronous (promise, but probably still blocking) grep
//
function async (list, expression, callback) { // {{{
	var q        = require('q')
		, deferred = q.defer()
		, retval   = [ ];

	if ((typeof expression) == 'object') {
		// Looks like they sent us an object. Verify it has exec()
		//
		if (expression.test && ((typeof expression.test) == 'function')) {
			return q.all( function () {
				retval = list.filter( expression.test )
				deferred.resolve( retval );
				return deferred.promise;
			} ).then( function (results) {
				return results;
			} );
		}
	}
	else if (typeof expression === 'function') {
		return q.all( function () {
			retval = list.filter( expression );
			deferred.resolve( retval );
			return deferred.promise;
		} ).then( function (results) {
			return callback( results );
		} );
	}
	else {
		return logwrap.error( 'Unclear what '.concat( expression, ' is.' ) );
	}
} // }}}

// Just figure out whether test exists in list
//
function list_in (list, test) { // {{{
	var yes = false;

	list.forEach( function (t) {
		if (t == test) {
			yes = true;
		}
	} )

	return yes;
} // }}}

// Return all the values of list that are also in test_list ('intersection')
// It's not really super complicated but it is a nice idiom to have a shorthand
// for.
//
function all_in (list, test_list) { // {{{
	var results = [ ];
	list.forEach( function (record) {
		sync( test_list, function (t) { if (t == record) { return true } } )
			.forEach( function (r) { results.push( r ) } )
	} );
	return results;
} // }}}

/**
 * @description Coalesce two objects into one
 *
 * @param {Object} from keys/values to read "from" into the coalesce
 * @param {Object} to the "target" object to coalesce into
 * @param {Object} parameters
 * @param {Boolean} paramaters.return-clone return a cloned object rather than operating on 'to'
 * @param {Array} paramaters.keys the list of keys to operate on (optional)
 *
 * @returns {Object} the coalesced object
 *
 * @example
 *   var coalesced = dg.coalesce(
 *     from, to,
 *       {
 *          keys: ['key1', 'key2'],
 *          'return-clone': true
 *       }
 *    )
 */
function coalesce_object (from, to, parameters) { // {{{
	var target;
	if (parameters['return-clone']) {
		target = clone( to );
	}
	else {
		target = to;
	}
	if (parameters.keys && parameters.keys.length) {
		parameters.keys.forEach( function (key) {
			target[key] = from[key]
		} )
	}
	else {
		Object.keys( from ).forEach( function (key) {
			target[key] = from[key];
		})
	}
	return target;
} // }}}

module.exports = {
	'in'       : list_in, // 'in' is a reserved word, kids
	'all_in'   : all_in,
	'async'    : async,
	'sync'     : sync,
	'deeply'   : deeply,
	'unique'   : unique,
	'flatten'  : flatten,

	'clone'    : clone,
	'extend'   : extend,

	'coalesce'        : coalesce_object,
	'coalesce_object' : coalesce_object
}


// NOTHING BELOW THIS LINE EXPORTED
//

function arrayhandler (a, xact) { // {{{
	// This is suspicious but I don't remember why I did it.
	//
	if ( Object.prototype.toString.call( a ).substr(8, 5) === 'Array' ) {
		// Explode arrays
		//
		logwrap.debug( 'Encountered array, pushing '.concat( a.length, ' elements onto stack.' ) );
		a.forEach( function (subelement) { heap.sessions[ xact.serial ].deep.push( subelement ) } );
		return true;
	}
} // }}}

// This is stolen/paraphrased from io.js
//
function extend (origin, add) { // {{{
	// Don't do anything if add isn't an object
	//
	if (!add || (typeof add != 'object')) {
		return origin;
	}

	Object.keys( add ).forEach( function (key) {
		origin[key] = add[key]
	} );
	return origin;
} // }}}

// Sugar on top of extend for clones
//
function clone (thing) { // {{{
	return extend( {}, thing );
} // }}}

function testwrapper (thing, target) { // {{{
	if (thing.test && ((typeof thing.test) == 'function')) {
		return thing.test( target );
	}
	else if ((typeof thing) == 'function') {
		return thing( target );
	}
	else {
		logwrap.error( 'Failing on confusing object from testwrapper.' );
		return new Error();
	}
} // }}}

function singlesession () { // {{{
	if (Object.keys( heap.sessions ).length == 1) {
		// There's already a session running, go grab it for the user.
		//
		var solo = Object.keys( heap.sessions )[0]
			, xact = xit.get( solo );

		return xact;
	}
	else if (Object.keys( heap.sessions ).length == 0) {
		// Set up a new session for them
		//
		var xact = new xit.xact();

		logwrap.debug( 'New root xid is '.concat( xact.serial ) );

		var sessions = heap.sessions
			, serial   = xact.serial;

		sessions[serial] = { };

		heap.sessions[ xact.serial ].results = [ ]; // the results we will be returning
		heap.sessions[ xact.serial ].deep    = [ ]; // the to-search pile
		heap.sessions[ xact.serial ].fresh   = true // this is a new, fresh, session

		xit.add( xact );

		return xact;
	}
	else if (Object.keys( heap.sessions ).length > 1) {
		// This is not a single-session instance
		//
		return false;
	}
	else {
		// Someone is funning us
		//
		return logwrap.error( 'Inconsistent session status.' );
	}
} // }}}

var log4js = require( 'log4js' ); // {{{

var config = {
	"appenders": [
		{
			"type": "console",
			"layout": {
				"type": "pattern",
				'pattern': '%d{ABSOLUTE} [%[%5.5p%]] [%12c] - %m',
				"tokens": {
					"pid" : function() { return process.pid; }
				}
			}
		}
	]
};

log4js.configure( config, {} );
var logger  = log4js.getLogger( 'deep-grep' )
	, logwrap = {
		debug : function (s) {
			if (process.env.DEBUG != undefined) { logger.debug(s) }
		},
		info  : function (s) {
			if (process.env.DEBUG != undefined) { logger.info(s) }
		},
		warn  : function (s) {
			if (process.env.DEBUG != undefined) { logger.warn(s) }
		},
		error : function (s) {
			if (process.env.DEBUG != undefined) { logger.error(s); return new Error(s) }
		},
	};

// }}}

var heap = {
	sessions: { },
};

logwrap.debug( 'Heap initialised.' );

var xit = require( 'xact-id-tiny' );
xit.start();

logwrap.debug( 'Transaction book spun up.' );


// @janearc // jane@cpan.org // vim:tw=80:ts=2:noet
