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

var sresults = [ ]  // a singleton, the results we will be returning
	, sdeep    = [ ]; // the to-search pile

function examine (t) {
	if (sdeep.length > 0) {
		var element = sdeep.shift();
		if ( typeof element === 'array' ) {
			element.forEach( function (subelement) { sdeep.push( subelement ) } );
			return true;
		}
		if (t(element)) { sresults.push( element ) }
	}
	else {
		return false;
	}
	return true;
}

// This should block, and tightly.
//
exports.deeply = function ( deep, test ) {
	sresults = [ ];
	sdeep    = deep;

	// The "design" here is to call examine repeatedly with test until it returns
	// false. The problem with calling while(deep) is that if you pop() or
	// shift() inside the while loop it does not actually destroy the original
	// argument (for whatever reason).
	//
	// See: https://gist.github.com/avriette/5721358bdc69f3982b72
	//
	// So the original effort here is to assign deep to sdeep (the present
	// argument to the singleton), and then just keep runningn the examine
	// subroutine until sdeep is exhausted (which happens in examine()). At
	// which point, sresults is returned to the caller. The 'return value' of
	// examine() is never actually stored because it's 'global'.
	//
	// Probably this design could be improved, but for now it works pretty
	// alright.
	//

	for (; examine(test); ) { }
	return sresults;
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
		//   https://github.com/avriette/deep-grep/blob/master/README.md#usage
		//
		// the 'behavior' hash, above, will determine what we actually do
		// during the flatten operation. For the moment (<= 0.0.2), it is unused
		// and lists are assumed.
		//
		if ( typeof element === 'array' ) ) {
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
	if (typeof expression === 'object') {
		// Looks like they sent us an object. Verify it has exec()
		//
		if (expression.hasOwnProperty( 'test' )) {
			if (typeof expression.test === 'function') {
				return List.map( function (t) { if (expression.test(t)) { return t } } );
			}
		}
	}
	else if (typeof expression === 'function') {
		return List.map( function (t) { if (expression(t)) { return t } } );
	}
	else {
		return new Error( 'Sorry, unclear what ' + expression + ' is.' );
	}
}

// Perform an asynchronous (promise, but probably still blocking) grep
//
exports.async = function ( List, expression, Callback ) {
	var q = require('q');
	if (typeof expression === 'object') {
		// Looks like they sent us an object. Verify it has exec()
		//
		if (expression.hasOwnProperty( 'test' )) {
			if (typeof expression.test === 'function') {
				return q.all(
					List.map( function (t) { if (expression.test(t)) { return t } } )
				).then( function (results) {
					return results;
				} );
			}
		}
	}
	else if (typeof expression === 'function' ]) {
		return q.all(
			List.map( function (t) { if (expression(t)) { return t } } )
		).then( function (results) {
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
		exports.sync( function (t) { if (t == record) { return true } }, Test_List )
			.forEach( function (r) { results.push( r ) } )
	} );
	return results;
}
