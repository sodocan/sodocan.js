#! /usr/bin/env node
var fs = require('fs');
var https = require('https');
var http = require('http');
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
  'version': '',
  'contains': ''
};

var fileOperations = function(paths) {
  var defaultProjectName = paths[0].match(/\/?([^\/]+)\./)[1];
  //last path in array is the output file; earlier ones are js files to parse
  //outputPath is a directory
  var outputPath = paths.pop();
  //var outputArray = [];
  var outputObj = {
    header: {
      project: '',
      version: '',
      author: ''
    },
    body: []
  };
  var numberOfFiles = paths.length;
  var classStore = {};
  var classList = [];
  var groupStore = {};
  var groupList = [];

  for (var i = 0; i < numberOfFiles; i++) {
    var parsedFileContents = parseMain(fs.readFileSync(paths[i]).toString());
    if (parsedFileContents.header.project !== '') {
      outputObj.header = parsedFileContents.header;
    }
    outputObj.body = outputObj.body.concat(parsedFileContents.body);
  }
  if (outputObj.header.projectName === '') {
    outputObj.header.projectName = defaultProjectName;
  }

  //add index property to each entry
  //create a list of all classes and groups
  for (var i = 0; i < outputObj.body.length; i++) {
    outputObj.body[i].index = i;
    var group = outputObj.body[i].group;
    var classContext = outputObj.body[i].classContext;
    if (group && !groupStore[group]) {
      groupList.push(group);
      groupStore[group] = group;
    }
    if (classContext && !classStore[classContext]) {
      classList.push(classContext);
      classStore[classContext] = classContext;
    }
  }

  outputObj.header.classList = classList;
  outputObj.header.groupList = groupList;

  // to write JSON and HTML files
  //create the specified directory if is does not exist
  if (!fs.existsSync(outputPath)){
    fs.mkdirSync(outputPath);
  }

  fs.writeFile(outputPath + '/parsedJSON.json', JSON.stringify(outputObj), function(err, data) {
    if (err) {
      console.log(err + '(will be triggered by mocha tests)');
    }
    else {
      console.log('Successfully parsed into JSON file.');
    }
  });

  // to write HTML file
  fs.writeFile(outputPath + '/parsedHTML.html', parsedToHTML(JSON.stringify(outputObj)), function(err, data) {
    if (err) {
      console.log(err + '(will be triggered by mocha tests)');
    }
    else {
      console.log('Successfully generated HTML file.');
    }
  });

  sendParsedToServer(JSON.stringify(outputObj));
};


var sendParsedToServer = function(string) {
  var options = {
    host:'localhost',
    port: '3000',
    json: true,
    headers: {
        "content-type": "application/json",
    },
    path: '/create',
    method: 'POST'
  };
  var request = http.request(options, function(res) {
    console.log("statusCode: ", res.statusCode);
    console.log("headers: ", res.headers);
  });

  request.on('error', function(err) {
    console.log('POST request error: ', err);
  });
  request.write(string);
  request.end();
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
  return headerObj;
};

var parseComments = function(string) {
  var results = [];  
  var blocks = findCommentBlocks(string);
  if (blocks) {
    blocks.forEach(function(block) {
      var blockObj = {
        functionName: '',
        params: [],
        returns: [],
        group: '',
        classContext: '',
        index: block.indexOfBlock
      };
      var entries = parseCommentBlock(block.blockString);
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
  var blocks = [];
  var blockRegex = /\/\*{1}\s*@doc([\s\S]+?)?\*\//g;
  var blockMatch = blockRegex.exec(string);
  while (blockMatch) {
    var blockData = {
      blockString: blockMatch[0],
      indexOfBlock: blockMatch.index
    };
    blocks.push(blockData);
    blockMatch = blockRegex.exec(string);
  }
  return blocks;
};

var findFunctionInfo = function(string) {
  // checks for independent functions: var xyz = function() {}
  var functionPatternA = /(?:[{,]|var)[\n\r]?\s*([a-zA-Z0-9_]+)\s*[=:]\s*function\(([a-zA-Z0-9_,\s]*)\)/g;
  // checks for independent functions: function xyz() = {}
  var functionPatternB = /function\s*([a-zA-Z0-9_]+)\s*\(([a-zA-Z0-9_,\s]*)\)/g;
  // checks for class methods: a.xyz = function() {}
  var functionPatternC = /([a-zA-Z0-9_]+\.)+([a-zA-Z0-9_]+)\s*=\s*function\(([a-zA-Z0-9_,\s]*)\)/g;
  // TODO possibly patternD: checks for class methods: var d3 = {xyz: function(){}}
  // and find the object name to be the context

  var functionInfoA = parseFunctionPatternA(string, functionPatternA);
  var functionInfoB = parseFunctionPatternB(string, functionPatternB);
  var functionInfoC = parseFunctionPatternC(string, functionPatternC);
  var functionInfo = functionInfoA.concat(functionInfoB).concat(functionInfoC);
  //var paramsPattern = /function\s*[a-zA-Z0-9_]*\s*(\([a-zA-Z0-9_,\s]*\))/g;

  // right now paramsList will return an array even if there's no params
  // may refactor later, may not
  // while (matchListA) {
  //   var paramsList = matchListA[2].split(',').map(function(param){
  //     return {'name': param.trim()};
  //   });
  //   paramsList = paramsList[0].name === '' ? [] : paramsList;
  //   var obj = {
  //     functionName: matchListA[1],
  //     params: paramsList,
  //     returns: [],
  //     explanations: {
  //       descriptions: '',
  //       examples: '',
  //       tips: ''
  //     }
  //   };
  //   functionInfo.push(obj);
  //   matchListA = functionPatternA.exec(string);
  // }

  // while (matchListB) {
  //   var paramsList = matchListB[2].split(',').map(function(param){
  //     return {'name': param.trim()};
  //   });
  //   paramsList = paramsList[0].name === '' ? [] : paramsList;
  //   var obj = {
  //     functionName: matchListB[1],
  //     params: paramsList,
  //     returns: [],
  //     explanations: {
  //       descriptions: '',
  //       examples: '',
  //       tips: ''
  //     }
  //   };
  //   functionInfo.push(obj);
  //   matchListB = functionPatternB.exec(string);
  // }

  return functionInfo.sort(function(a, b) {
    return a.index > b.index;
  });
};

var parseFunctionPatternA = function(string, pattern) {
  var matchListA = pattern.exec(string);
  var results = [];  
  while (matchListA) {
    console.log('A match index is: ', matchListA.index);
    var paramsList = matchListA[2].split(',').map(function(param){
      return {'name': param.trim()};
    });
    paramsList = paramsList[0].name === '' ? [] : paramsList;
    var obj = {
      functionName: matchListA[1],
      params: paramsList,
      returns: [],
      explanations: {
        descriptions: '',
        examples: '',
        tips: ''
      },
      classContext: '',
      index: matchListA.index
    };
    results.push(obj);
    matchListA = pattern.exec(string);  
  }
  return results;
};

var parseFunctionPatternB = function(string, pattern) {
  var matchListB = pattern.exec(string);
  var results = [];  
  while (matchListB) {
    console.log('B match index is: ', matchListB.index);
    var paramsList = matchListB[2].split(',').map(function(param){
      return {'name': param.trim()};
    });
    paramsList = paramsList[0].name === '' ? [] : paramsList;
    var obj = {
      functionName: matchListB[1],
      params: paramsList,
      returns: [],
      explanations: {
        descriptions: '',
        examples: '',
        tips: ''
      },
      classContext: '',
      index: matchListB.index
    };
    results.push(obj);
    matchListB = pattern.exec(string);
  }
  return results;
};

var parseFunctionPatternC = function(string, pattern) {
  var matchListC = pattern.exec(string);
  var results = [];
  while (matchListC) {
    console.log('C match index is: ', matchListC.index);
    var classContext = matchListC[1].trim(); 
    var paramsList = matchListC[3].split(',').map(function(param) {
      return {name: param.trim()};
    });
    paramsList = paramsList[0].name === '' ? [] : paramsList;
    var obj = {
      functionName: matchListC[2],
      params: paramsList,
      returns: [],
      explanations: {
        descriptions: '',
        examples: '',
        tips: ''
      },
      classContext: classContext,
      index: matchListC.index
    };
    results.push(obj);
    matchListC = pattern.exec(string);
  }
  return results;
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

  //sort by regex match index
  combinedArr.sort(function(a, b) {
    return a.index > b.index;
  });

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
if (userArgs[0] !== 'spec') fileOperations(userArgs);

// @params: 'abc', @name: 'name'
// @params: [{ name: 'sdfsd' type: 'Boolean' }, { name: 'sdfsd' type: 'Boolean' }]
  // check if it's an object or an array
    // if object, pushes into an empty array
// @returns: [{ name: 'sdfsd' type: 'Boolean' }, { name: 'sdfsd' type: 'Boolean' }]
  // check if it's an object or an array
    // if object, pushes into an empty array

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