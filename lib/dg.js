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

function examine () {
	if (sdeep.length > 0) {
		var element = sdeep.shift();
		if ( element.constructor
			.toString()
			.substr( element.constructor.toString().indexOf(' ') + 1, 5 ) == 'Array'
			) {
			element.forEach( function (subelement) { sdeep.push( subelement ) } );
			return true;
		}
		if ( t(element) ) {
			sresults.push( t )
			return true;
		}
	}
	else {
		return false;
	}
}

// This should block, and tightly.
//
exports.deeply = function ( deep, test ) {
	sresults = [ ];
	sdeep    = deep;

	for (; examine(test); ) { }
	return sresults;
}

