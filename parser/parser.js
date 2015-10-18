#! /usr/bin/env node
var fs = require('fs');
var parsedToHTML = require('./parsedToHTML.js');

//consider including more specific types of description: params description, returns description
//maybe we don't need 'name' for the 'returns' array

var properties = {
  'functionName': '',
  'params': [],
  'returns': [],
  'group': '',
  'descriptions': '',
  'examples': '',
  'tips': '',
  'classContext': '', 
  'project': '',
  'author': '',
  'version': ''
};

var fileOperations = function(paths) {
  var defaultProjectName = paths[0].match(/\/?([^\/]+)\./)[1];
  //last path in array is the output file; earlier ones are js files to parse
  var outputPath = paths.pop();
  var outputArray = [];
  var numberOfFiles = paths.length;
  var hasProjectName = false;


  // right now, header has to be in the first file that's specified in CLI
  // TODO: default to the file that has header, only one project allowed per command 
  // TODO: output is an obj rather than an array
  // file1: noHeader file2: header, file3: noHeader
  for (var i = 0; i < numberOfFiles; i++) {
    var parsedFileContents = parseMain(fs.readFileSync(paths[i]).toString());
    if (outputArray.length && !parsedFileContents.header.project && !parsedFileContents.header.author && !parsedFileContents.header.version) {
      outputArray[0].body.concat(parsedFileContents.body);
    }
    else {
      outputArray.push(parsedFileContents);
      if (parsedFileContents.header.project !== '') {
        hasProjectName = true;
      }
    }
  }
  if (!hasProjectName) {
    outputArray[0].header.project = defaultProjectName;
  }

  //file1: noHeader file2: header, file3: noHeader

  fs.writeFile(outputPath, JSON.stringify(outputArray), function(err, data) {
    if (err) {
      console.log(err + '(will be triggered by mocha tests)');
    }
    else {
      console.log('Successfully parsed all files');
    }
  });

  // fs.writeFile(outputPath, '', function(err, data) {
  //   for (var i = 0; i < paths.length; i++) {
  //     fileNumbers.push(i + 1);
  //     fs.readFile(paths[i], function(err, data) {
  //       var JSONdata = JSON.stringify(parseMain(data.toString()));
  //       console.log('JSONdata in fileOperations:', JSONdata);
  //       fs.appendFile(outputPath, JSONdata, function(err, data) {
  //         console.log('successfully parsed file ' + fileNumbers.shift() + ' of ' + paths.length);
  //       });
  //     });
  //   }
  // });
};

// right now does not distinguish between API and helper functions
var parseMain = function(string) {
  // assuming function names are supplied
  var header = parseHeader(string);
  var functionInfo = findFunctionInfo(string);
  var commentInfo = parseComments(string);
  return {header: header, body: combineInfo(functionInfo, commentInfo)};
};


//TODO: fix (only trimming off number of characters of @doc, not @header.  add isHeader flag
//parameter to parseCommentBlock and processEntry)
var parseHeader = function(string) {
  var header = findHeader(string);
  // console.log('header before processing: ', header);
  var headerObj = {
    project: '',
    author: '',
    version: ''
  };
  if (header) {
    var entries = parseCommentBlock(header, true);
    entries.forEach(function(entry) {
      var entryObj = processEntry(entry);
      headerObj[entryObj.propertyName] = entryObj.content;
    });
  }
  return [headerObj];
};

var parseComments = function(string) {
  var results = [];  
  var blocks = findCommentBlocks(string);
  if (blocks) {
    blocks.forEach(function(block) {
      var blockObj = {
        'functionName': '',
        'params': [],
        'returns': [],
        'group': '',
        'classContext': ''
      };
      var entries = parseCommentBlock(block);
      entries.forEach(function(entry) {
        var entryObj = processEntry(entry);
        blockObj[entryObj.propertyName] = entryObj.content;
      });
      //add nested explanations object
      buildExplanations(blockObj);
      results.push(blockObj);
    }); 
  }
  return results;
};

var buildExplanations = function(blockObj) {
  blockObj.explanations = {
    descriptions: blockObj.descriptions || '',
    examples: blockObj.examples || '',
    tips: blockObj.tips || ''
  };
  delete blockObj.descriptions;
  delete blockObj.examples;
  delete blockObj.tips;
};

var findHeader = function(string) {
  var headerRegex = /\/\*\s*@header(?:[\s\S]+?)?\*\//;
  var headerString = string.match(headerRegex);
  if (headerString) {
    headerString = headerString.join();
  }  
  return headerString;
};

var findCommentBlocks = function(string) {
  //search the string for a substring beginning with /* and ending with */
  // right now assumes @doc is the first thing in the block after 0 or more white spaces
  // but not other chars
  var blockRegex = /\/\*{1}\s*@doc([\s\S]+?)?\*\//g;
  return string.match(blockRegex);
};

/* 
  stuff
*/

var findFunctionInfo = function(string) {
  var functionPatternA = /(?:[{,]|var)[\n\r]?\s*([a-zA-Z0-9_]+)\s*[=:]\s*function\(([a-zA-Z0-9_,\s]*)\)/g;
  var functionPatternB = /function\s*([a-zA-Z0-9_]+)\s*\(([a-zA-Z0-9_,\s]*)\)/g;
  //var paramsPattern = /function\s*[a-zA-Z0-9_]*\s*(\([a-zA-Z0-9_,\s]*\))/g;

  var matchListA = functionPatternA.exec(string);
  var matchListB = functionPatternB.exec(string);
  var functionInfo = [];

  // right now paramsList will return an array even if there's no params
  // may refactor later, may not
  while (matchListA) {
    var paramsList = matchListA[2].split(',').map(function(param){
      return {'name': param.trim()};
    });
    var obj = {
      functionName: matchListA[1],
      params: paramsList,
      explanations: {
        descriptions: '',
        examples: '',
        tips: ''
      }
    };
    functionInfo.push(obj);
    matchListA = functionPatternA.exec(string);
  }

  while (matchListB) {
    var paramsList = matchListB[2].split(',').map(function(param){
      return {'name': param.trim()};
    });
    var obj = {
      functionName: matchListB[1],
      params: paramsList
    };
    functionInfo.push(obj);
    matchListB = functionPatternB.exec(string);
  }

  return functionInfo.sort(function(a, b) {
    return b.functionName < a.functionName;
  });
};

// {foo: bar, faz: function()}
// var func = function(a)
// function func(a)

var parseCommentBlock = function(commentBlock, isHeader) {

  //@functionName:
  // @params: '...stuff...' 
  //                   @description: '....');
  commentBlock = commentBlock.substring(2, commentBlock.length - 2);
  commentBlock = commentBlock.trim();
  //trimming off '@header' or '@docs'
  if (isHeader) {
    commentBlock = commentBlock.substring(7);
  } else {
    commentBlock = commentBlock.substring(4);
  }
  commentBlock = commentBlock.trim();
  // get rid of the first '@' symbol
  commentBlock = commentBlock.substring(1);
  // console.log('header before splitting:', commentBlock);
  // check if matches pattern: [\n\r]\s*@; if so, there are multiple entries
  var entries;
  if (commentBlock.match(/[\n\r]\s*@/)) {
    entries = splitEntries(commentBlock);
  } else {
    entries = [commentBlock];
  }   
  return entries;
};

var propertyIsValid = function(propName) {
  return (propName in properties);
};

var processEntry = function(entry) {
  //grab property name (in between @ and :)
  //grab contents after colon

  var propNameRegex = /^\w+?\s*:/; 
  var nameOfProperty = entry.match(propNameRegex).join();
  var propNameLength = nameOfProperty.length;
  nameOfProperty = nameOfProperty.substring(0, propNameLength - 1).trim();
  if (!propertyIsValid(nameOfProperty)) {
    console.log('ERROR: Invalid property name: ', nameOfProperty);
  }
  var parsedContent = entry.substring(propNameLength).trim();
  //if the content is an object or array, convert it to JS
  if (parsedContent[0] === '[' || parsedContent[0] ==='{') { 
    parsedContent = convertToJS(parsedContent);
  }  
  else {
    parsedContent = parseString(parsedContent);
  }
  var entryObj = { 
    propertyName: nameOfProperty, 
    content: null
  };
  // now only checks for str/obj/array; may refactor to include num/bool if necessary
  if (Array.isArray(parsedContent) || typeof parsedContent === 'string') {
    entryObj.content = parsedContent;
  } else if (typeof parsedContent === 'object') {
    entryObj.content = [];
    entryObj.content.push(parsedContent);
  } else {
    console.log('ERROR: invalid content type: ', typeof parsedContent);
  }
  return entryObj;
};

// properties {
// header: {
//  project, 
//  author, 
//}
//}

var convertToJS = function(string) {
  var fixedJSON = string.replace(/(['"])?([a-zA-Z0-9_]+)(['"])?\s*:/g, '"$2": ');
  fixedJSON = fixedJSON.replace(/:\s*(['])([^']+)(['])/g, ':"$2"');
  return JSON.parse(fixedJSON); 
};

//[^']*
// : 'stuff_*&&^%%*(@())!##@""'
// : 'she said: "oh hi"'
// : "she said: 'oh hi'"
// : 'stuff', name: 'stuff'
// @functionName: 'stuff'
// @description: 'convoluted: "yes"'
// JSON.parse('"stuff: \'stuff\'"'); "stuff: 'stuff'"

// first char is neither [ or {, so parse the plain string
  // check if first char is ' 
    // find double quotes (unescaped) 
      // escape them and replace them with single quotes  replace " with \'
    // replace head and tail with double quotes 

var parseString = function(string) {
  if (string[0] === "'" && string[string.length - 1] === "'") {
    string = string.replace(/"/g, "\'");
    string = '"' + string.substring(1, string.length - 1) + '"';
  }
  else if (string[string.length - 1] !== '"') {
    string = string.replace(/"/g, "\'");
    string = '"' + string + '"';
  }
  return JSON.parse(string);
};

var splitEntries = function(string) {
  var entryDividingRegex = /[\r\n]\s*@/g;
  return string.split(entryDividingRegex);
};

var combineInfo = function(functionArr, commentArray) {
  var combinedArr = [];
  var storage = {};

  for (var i = 0; i < functionArr.length; i++) {
    storage[functionArr[i].functionName] = functionArr[i];
  }
  for (var j = 0; j < commentArray.length; j++) {
    storage[commentArray[j].functionName] = commentArray[j];
  }
  for (var name in storage) {
    combinedArr.push(storage[name]);
  }
  return combinedArr;
};

module.exports = {
  parseHeader: parseHeader,
  parseComments: parseComments,
  findCommentBlocks: findCommentBlocks,
  parseCommentBlock: parseCommentBlock,
  splitEntries: splitEntries,
  processEntry: processEntry,
  convertToJS: convertToJS,
  findFunctionInfo: findFunctionInfo,
  parseMain: parseMain,
  buildExplanations: buildExplanations
};

//for command line use
var userArgs = process.argv.slice(2);
console.log(userArgs);
if (userArgs) fileOperations(userArgs);

// @params: 'abc', @name: 'name'
// @params: [{ name: 'sdfsd' type: 'Boolean' }, { name: 'sdfsd' type: 'Boolean' }]
  // check if it's an object or an array
    // if object, pushes into an empty array
// @returns: [{ name: 'sdfsd' type: 'Boolean' }, { name: 'sdfsd' type: 'Boolean' }]
  // check if it's an object or an array
    // if object, pushes into an empty array

// extra(?): how to handle multiple files (organize result, etc)

// error catching 
  // for file source
// find comment blocks : /** ... */
  //@doc signals that the documentation info for a function is to follow
  // loook for @keywords and call respective functions to further parse the keyword
    // @functionName: if not provided, look for function dec patter; 
        // if no function dec pattern, throw new Error
    // @methodContext = Vector  (extra: find a way to infer this from surroundings?)
    //   Vector.calculateMagnitude
  //check for one the two function patterns, either function Name(args) {} or var Name = function() {}
  //Name is value of @functionName
  
  //return json array of objects
  
  // @functionName
  // @params
    // @name: name of param
    // @type
    // @default: default value of param (optional)
  // @returns
    // @name: name of return value
    // @type
  // @description
  // @group: heading for a group of functions
  
  // extra: @special (user-defined keyword)
  // extra: cross-referencing {@link BABYLON.Vector3|Vector3} i 