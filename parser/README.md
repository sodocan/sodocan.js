# sodocan-parser

sodocan-parser is part of [Sodocan.js](http://www.sodocanjs.com) - a collaborative documentation templating service that turns your source code and comments into angular-based documentation ready to be hosted and crowd-sourced. 

sodocan-parser is a stand-alone code parser that generates docs in form of a JSON object and a simple HTML file for your convenience based on your comments and source code. 

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

Without any additional effort on your part, sodocan-parser can parse a source file for basic information to be 
used in a doc: names of functions, and names of parameters for each function.  An entry for each function will
be created in the output JSON and HTML.  However, a user may want to insert additional information into the source
for the parser to pick up.  They can do this by writing comments in a specific format, as follows (this format will 
be familiar to anyone who has used JSDoc or Javadoc).

A comment block will be read by the parser if it begins with a slash and two asterisks (/\*\*) and ends with an 
asterisk and slash (\*/).  Within each comment block, specific keywords, which must be prefaced with an @ symbol, are
used to give information.  Unless otherwise noted, the value you provide for the keyword can be either plaintext, or in the 
syntax of a javascript string (with quotes).
Example comment block with several keywords:

    /**
    @functionName: findMatches
    @ params: [{ name: input, type: string}, { name: isVector, type: boolean}]
    @include
    */

There are two types of comment blocks: the header and function blocks.

###Headers
You can only use one header block per project.  Place it at the top of one of your files.  

The following keywords can be used in a header.  Use as many or as few as you like (except for @header at the start of the block text, which is required to indicate that it is a header block).

**@header**: indicate a header block.

**@project** : the name of the project.

**@author**: The author(s) of the project.

**@version**: Current version number.

**@includeByDefault**: Set to either 'true' or 'false'.  (if you don't include this keyword, the default value is true). This determines which functions will be included in the doc.  If true,  all functions will be included except for ones which have a comment block above them containing the '@omit' keyword.  If this is false, only functions with a comment block containing '@include' will be included.

Example header:

    /**
    @header
    @project: Marketplacely
    @author: Harold
    @version: 1.0
    @includeByDefault: false
    */


###Function blocks
Put one of these comment blocks above a function you'd like to document in greater detail.  
The following keywords are available.  All are optional (note that if you leave out @functionName 
and @params, these will be automatically added from the code below).

**@functionName**: name of the function. 

**@params**: parameters for the function.  Should be represented as a JS object (for a single param) 
or an array of JS objects (multiple params). 
Each param object should have a 'name' property and a 'type' property.

**@returns**: a JS object with a 'type' property.  Can be an
array of objects if there are multiple possible return 
types.

**@group**: Name of a group you want this function to be displayed in. 
Multiple functions with the same @group value will be grouped together
in the doc.

**@description**: a description of the function; tell us what it does!

**@example**: an example of its usage.

**@tips**: any miscellaneous comments/advice.

**@classContext**: the parent class (if the function is a method).

**@include**: include this function in the doc (only has an effect if includeByDefault is set to 
'false' in the header).

**@omit**: omit this function from the doc (only has an effect if icludeByDefault is set to 'true'
in the header).

**@class**: indicates a function that is a constructor for a class.  If other functions are 
on declared on the prototype for this constructor, this constructor's name will automatically be
assigned as their classContext value.  Otherwise, you can manually link other functions to this class
by using the @classContext keyword in their function blocks.

Example function block:

    /**
    @functionName: eatFigs
    @params: [{ name: tree, type: string}, { name: numSeeds, type: number }]
    @returns: {type: number}
    @group: Fruit Utils
    @description: Eat a fig and/or figs.  
    @tips: Don't eat too many...
    @classContext: Human
    @include
    */

## Pronunciation

It's made to sound like 'so-dough-ken' (think Hadoken) and look like 'soda can'.

# License

MIT [http://rem.mit-license.org](http://rem.mit-license.org)
