// deep grep
//
//   if you're like me, you like data structures and you don't mind them
//   being nested to various levels and of various types.
//
//   sometimes, though, when you want something deep in one of these
//   structures, it can be a pain in the ass to ask it for:
//
//   var w = Object.keys( ds ).map( function (f) {
//     return ds[f].forEach( function (elem) {
//       return ds[f][elem].get_records( { matching: 'foo[^.]+.txt' } )
//     } )
//   } )
//
//   and similar sometimes you just want the things and you don't want to have
//   to describe your data structure or nested object methods in excruciating
//   detail to go and find them.
//
//   also i get sick of the amount of nested scoping node does, and this
//   allows me to abstract some of that away into a lib.
//

"use strict";

var logger = require( 'log4js' ).getLogger();

var S = require('singleton').get();
S.results = [ ]; // the results we will be returning
S.deep    = [ ]; // the to-search pile

function bonk (los) {
	return los.filter( function (s) {
		if (typeof s != 'string') {
			return JSON.stringify(s, null, 2);
		}
		else {
			return s;
		}
	} ).join( '\n\t' );
}

function testwrapper (thing, target) {
	if (thing.test && ((typeof thing.test) == 'function')) {
		return thing.test( target );
	}
	else if ((typeof thing) == 'function') {
		return thing( target );
	}
	else {
		logger.error( 'Failing on confusing object from testwrapper.' );
		return new Error();
	}
}

function arrayhandler (a) {
	// This is suspicious but I don't remember why I did it.
	//
	if ( Object.prototype.toString.call( a ).substr(8, 5) === 'Array' ) {
		// Explode arrays
		//
		logger.debug( 'Encountered array, pushing ' + a.length + ' elements onto stack.' );
		a.forEach( function (subelement) { S.deep.push( subelement ) } );
		return true;
	}
}

exports.deeply = function ( deep, test, parameters ) {
	if (S.deep.length > 0) {
		logger.error( 'Called deeply when sdeep stack not empty.' );
	}
	else {
		// Blowing away the singleton because deeply is being called anew
		//
		S.deep    = deep;
		S.results = [ ];
	}

	// See: https://gist.github.com/janearc/5721358bdc69f3982b72
	//
	// Probably this design could be improved, but for now it works pretty
	// alright.
	//

	for (; function (t) {
		if (S.deep.length > 0) {
			var element = S.deep.shift();
			logger.debug( 'Shifted sdeep, ' + S.deep.length + ' elements remain.' );

			// Handle arrays, break if this is something to explode and handle
			// later.
			//
			if (arrayhandler( element )) { return true }

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
						logger.debug( 'Found a hashlike match.' );
						S.results.push( match );
					}
					else {
						logger.debug( 'Discarded a hashlike match.' );
					}
				} );
			}

			if (testwrapper(test, element)) {
				logger.debug( 'Test accepted ' , element );
				S.results.push( element )
			}
			else {
				logger.debug( 'Test rejected ' , element );
			}
		}
		else {
			logger.debug( 'Finished sdeep.' );
			return false;
		}
		return true;
	}( test ); ) { } // for

	return S.results;
}

// Flatten the nested elements of a list into a single scope
//
exports.flatten = function ( list, behavior ) {
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

		// this makes me feel so dirty:
		//  Object.prototype.toString.call( f ).substr(8, 5)
		if ( Object.prototype.toString.call( element ).substr(8, 5) === 'Array' ) {
			element.forEach( function (subelement) { local.push( subelement ) } );
		}
		else {
			flat.push( element );
		}
	}

	return flat;

}

// Return the unique elements of a (optionally nested) list
//
exports.unique = function ( list ) {
	var flist  = exports.flatten( list )
		, utable = { }
	
	flist.forEach( function (k) { if (utable[k]) { utable[k]++ } else { utable[k] = 1 } } );

	return Object.keys( utable );
}

// Perform a synchronous (no-promise, blocking) grep
//
exports.sync = function ( List, expression ) {
	// Please note that the map() here in node is.. ridiculous. See the following gist:
	//   https://gist.github.com/janearc/9e31fcc455617c769d65
	var retval = [ ];
	if ((typeof expression) == 'object') {
		// Looks like they sent us an object. Verify it has test()
		//
		if (expression.test && ((typeof expression.test) == 'function')) {
			// We allow them to send us any object that can test. We call this
			// polymorphism. It's a good thing.
			//
			retval = List.filter( function (t) {
				// Without the wrapper above, we get:
				//
				//   TypeError: Method RegExp.prototype.test called on incompatible receiver undefined
				//
				// which is .. it seems to be an error in their library. There's
				// implicit coercion to strings with the passed function wrapper
				//
				// console.log( 't: ' + t );
				return expression.test(t);
			} );
			return retval;
		}
	}
	else if ((typeof expression) == 'function') {
		retval = List.filter( expression );
		return retval;
	}
	else {
		return new Error( 'Sorry, unclear what ' + expression + ' is.' );
	}
}

// Perform an asynchronous (promise, but probably still blocking) grep
//
exports.async = function ( List, expression, Callback ) {
	var q        = require('q')
		, deferred = q.defer()
		, retval   = [ ];

	if ((typeof expression) == 'object') {
		// Looks like they sent us an object. Verify it has exec()
		//
		if (expression.test && ((typeof expression.test) == 'function')) {
			return q.all( function () {
				retval = List.filter( expression.test )
				deferred.resolve( retval );
				return deferred.promise;
			} ).then( function (results) {
				return results;
			} );
		}
	}
	else if (typeof expression === 'function') {
		return q.all( function () {
			retval = List.filter( expression );
			deferred.resolve( retval );
			return deferred.promise;
		} ).then( function (results) {
			return Callback( results );
		} );
	}
	else {
		return new Error( 'Sorry, unclear what ' + expression + ' is.' );
	}
}

// Just figure out whether Test exists in List
//
exports.in = function ( List, Test ) {
	var yes = false;

	List.forEach( function (t) {
		if (t == Test) {
			yes = true;
		}
	} )

	return yes;

}

// Return all the values of List that are also in Test_List ('intersection')
// It's not really super complicated but it is a nice idiom to have a shorthand
// for.
//
exports.all_in = function ( List, Test_List ) {
	var results = [ ];
	List.forEach( function (record) {
		exports.sync( Test_List, function (t) { if (t == record) { return true } } )
			.forEach( function (r) { results.push( r ) } )
	} );
	return results;
}
