# sodocan-parser

sodocan-parser is part of [Sodocan.js](http://www.sodocanjs.com) - a collaborative documentation templating service that turns your source code and comments into angular-based documentation ready to be hosted and crowd-sourced. 

sodoan-parser is a stand-alone code parser that generates docs in form of a JSON object and a simple HTML file for your convenience based on your comments and source code. 

It recognizes industry standard keywords such as @param and @description, as illustrated in the Comment Syntax session below.

In addition, sodocan-parser can also take comment-less js files and compile a basic list of function names and parameter names. 

[![NPM version](https://badge.fury.io/js/sodocan-parser.svg)](https://npmjs.org/package/sodocan-parser)
[![Travis Status](https://travis-ci.org/sodocan/sodocan.js.svg?branch=master)](https://travis-ci.org/sodocan/sodocan.js)

# Installation

Either through forking or by using [npm](http://npmjs.org) (the recommended way):

    npm install -g sodocan-parser

And sodocan-parser will be installed in to your bin path. Note that you must explicitly tell npm to install globally as sodocan-parser is a command line utility.

# Usage

sodocan-parser takes either the directory of your files or you can specify an arbitrary number of individual file paths. The last argument should always be the output directory path.

    parse [your dir or your file path(s)] [output dir]

Here is an example:

    parse js/underscore.js results

sodocan-parser also takes a github link as the filepath you would like to parse. Currently, we only support one single file:
    
    parse https://github.com/jashkenas/underscore/blob/master/underscore.js rsults

## Comment syntax

TODO

## Pronunciation

It's made to sound like 'so-dough-ken' (think Hadoken) and look like 'soda can'.

# License

MIT [http://rem.mit-license.org](http://rem.mit-license.org)
