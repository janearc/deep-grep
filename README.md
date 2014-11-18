deep-grep
=========

Too many haystacks, not enough needles

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

Author
====

[@avriette](https://github.com/avriette), jane@cpan.org
