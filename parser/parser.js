#! /usr/bin/env node
var fs = require('fs');
var https = require('https');
var http = require('http');
var parsedToHTML = require('./parsedToHTML.js');
var networkRequest = require('./networkRequest.js');

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

  var outputObj = {
    header: {
      project: '',
      version: '',
      author: ''
    },
    body: []
  };
  var outputPath = paths.pop();
  //if the user is parsing local files
  if (!isNetworkRequest(paths[0])) {
    var defaultProjectName = paths[0].match(/\/?([^\/]+)\./)[1];
    //last path in array is the output file; earlier ones are js files to parse
    //outputPath is a directory
    //var outputArray = [];
    var numberOfFiles = paths.length;
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

    constructGroupClassAndIndex(outputObj);
    // to write JSON and HTML files
    //create the specified directory if is does not exist
    writeIntoLocalFiles(outputObj, outputPath);
    // make POST request to our server to send over the processed json file
    sendParsedToServer(JSON.stringify(outputObj));
  } else {
    // for github API call - going to exist in some if block
    // check if https:// or http://
    // githugAPICallInfo is an array with [API call path, username, repo name]
    var githubAPICallInfo = networkRequest.parseUrl(paths[0]);
    if (githubAPICallInfo) {
      networkRequest.githubAPICallForFile(githubAPICallInfo, function(data) {
        var parsedFileContents = parseMain(data);
        if (parsedFileContents.header.project === '') {
          outputObj.header.project = githubAPICallInfo[2];
        }
        outputObj.body = parsedFileContents.body;
        constructGroupClassAndIndex(outputObj);
        writeIntoLocalFiles(outputObj, outputPath);
        // make POST request to our server to send over the processed json file
        sendParsedToServer(JSON.stringify(outputObj));
      }); 
    }
  }
};
<<<<<<< HEAD

var isNetworkRequest = function(path) {
  return (path.match('http://') || path.match('https://'));
};

=======

var isNetworkRequest = function(path) {
  return (path.match('http://') || path.match('https://'));
};

>>>>>>> 46dea4df865660ae5cc7045620c3b6b2dd3baa1a
var constructGroupClassAndIndex = function(outputObj) {
  //add index property to each entry
  //create a list of all classes and groups
  var classStore = {};
  var classList = [];
  var groupStore = {};
  var groupList = [];
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
};

var writeIntoLocalFiles = function(outputObj, outputPath) {
  // to write JSON and HTML files
  //create the specified directory if is does not exist
  if (!fs.existsSync(outputPath)){
    fs.mkdirSync(outputPath);
  }
  // to write JSON file
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
};

var sendParsedToServer = function(string) {
  var options = {
    host:'localhost',
    port: '3000',
    headers: {
      "content-type": "application/json",
    },
    path: '/create/',
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
  var functionPatternC = /((?:[a-zA-Z0-9_]+\.)+)([a-zA-Z0-9_]+)\s*=\s*function\(([a-zA-Z0-9_,\s]*)\)/g;
  // TODO possibly patternD: checks for class methods: var d3 = {xyz: function(){}}
  // and find the object name to be the context

  var functionInfoA = parseFunctionPatternA(string, functionPatternA);
  var functionInfoB = parseFunctionPatternB(string, functionPatternB);
  var functionInfoC = parseFunctionPatternC(string, functionPatternC);
  var functionInfo = functionInfoA.concat(functionInfoB).concat(functionInfoC);

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
      functionName: classContext + matchListC[2],
      params: paramsList,
      returns: [],
      explanations: {
        descriptions: '',
        examples: '',
        tips: ''
      },
      classContext: classContext.slice(0, classContext.length - 1),
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

//each elem in commentArray has an index property
//push all elements to a results array
//sort by index
//iterate over elems
//if elem has no functionName
  //grab function name (and param names) from following element
  //delete following element

//add check for whether first one is comment or function
//push into second results array after getting the data from the next 
//element (more efficient than splice)

//(possible: keep track of which are comments and which are functions to avoid
  //potential for problems if there are consecutive comment blocks?)  
var combineInfo = function(functionArray, commentArray) {
  var combinedArray = functionArray.concat(commentArray);
  //mark elements to indicate whether they are sourced from a comment,
  //to be safe if user does something weird with ordering comments/functions
  for (var i = 0; i < combinedArray.length; i++) {
    combinedArray[i].fromComment = (i >= functionArray.length);
    //if (combinedArray[i].index === 782) console.log('SPICY: ', combinedArray[i]);
  }
  var results = [];
  //sort in order of appearance in the file
  combinedArray.sort(function(a, b) {
    return a.index - b.index;
  });
  //console.log('COMBINED ARRAY before removing duplicates:',combinedArray);
  //take functionName and params info from the following function if not provided in a comment
  for (var i = 0; i < combinedArray.length; i++) {

    //add to results and break if we're on the last element
    if (i === combinedArray.length - 1) {
      results.push(combinedArray[i]);
      break;
    } 

    var current = combinedArray[i];
    var next = combinedArray[i + 1];
    //we're only interested in taking info from the next entry if we're on a comment
    //and the next one is a JS entry
    if (current.fromComment && !next.fromComment) { 
      if (current.functionName === '') {
        current.functionName = next.functionName;
      }
      //ensure that leaving out params in a comment will only grab the next one
      //if the next one has the same functionName, or current functionName is blank
      if (current.params[0] === undefined && 
        (current.functionName === '' || current.functionName === next.functionName)) {
        current.params = next.params;
      }
    }
    delete current.fromComment;
    results.push(current);

    //skip next element, if it is the JS corresponding to the current comment 
    if (next.functionName === current.functionName) {
      i++;
    }
  }
  return results;
};



//OLD VERSION  
// var oldCombineInfo = function(functionArr, commentArray) {
//   var combinedArr = [];
//   var storage = {};

//   for (var i = 0; i < functionArr.length; i++) {
//     storage[functionArr[i].functionName] = functionArr[i];
//   }
//   for (var j = 0; j < commentArray.length; j++) {
//     storage[commentArray[j].functionName] = commentArray[j];
//   }
//   for (var name in storage) {
//     combinedArr.push(storage[name]);
//   }

//   //sort by regex match index
//   combinedArr.sort(function(a, b) {
//     return a.index > b.index;
//   });

//   return combinedArr;
// };

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
  buildExplanations: buildExplanations,
  combineInfo: combineInfo
};

//for command line use
var userArgs = process.argv.slice(2);
console.log(userArgs);
if (userArgs[0] !== 'spec') fileOperations(userArgs);


//DONE: grab functionName from next function after a comment block (no need for
 //@functionName property anymore.)
//TODO: double check that params are getting read from undersscore correctly
//(_.each?)
//TODO: add @class functionality
//TODO: start blocks with ** to distinguish from normal comments

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