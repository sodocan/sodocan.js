var properties = {
  functionName: '',
  params: [],
  returns: [],
  group: '',
  descriptions: '',
  examples: '',
  tips: '',
  classContext: '', 
  project: '',
  author: '',
  version: '',
  includeByDefault: '',
  omit: '',
  include: '',
  class: ''
};

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

var processContentlessEntry = function(entry) {
  var entryObj = {
    propertyName: entry.trim(),
    content: ''
  };
  return entryObj;
};

var convertToJS = function(string) {
  var fixedJSON = string.replace(/(['"])?([a-zA-Z0-9_]+)(['"])?\s*:/g, '"$2": ');
  fixedJSON = fixedJSON.replace(/:\s*(['])([^']+)(['])/g, ':"$2"');
  return JSON.parse(fixedJSON); 
};

var propertyIsValid = function(propName) {
  return (propName in properties);
};

var processEntry = function(entry) {
  //grab property name (in between @ and :)
  //grab contents after colon
  //includes \n and \r to catch @omit and @include
  var propNameRegex = /^\w+?\s*:/; 

  //some keywords have no content, like @omit
  if (!entry.match(propNameRegex)) {
    console.log(entry);
    return processContentlessEntry(entry);
  } 
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
    if (outputObj.body[i].class !== undefined) {
      classList.push(outputObj.body[i].class);
    }
    if (group && !groupStore[group]) {
      groupList.push(group);
      groupStore[group] = group;
    }
  }

  outputObj.header.classList = classList;
  outputObj.header.groupList = groupList;
};

var parseFunctionPatternA = function(string, pattern) {
  var matchListA = pattern.exec(string);
  var results = [];  
  while (matchListA) {
    //console.log('A match index is: ', matchListA.index);
    // console.log('current match to patternA is: ', matchListA);
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
    //console.log('B match index is: ', matchListB.index);
    // console.log('current match to patternB is: ', matchListB);
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
    //console.log('C match index is: ', matchListC.index);
    // var classContext = matchListC[1].trim(); 
    var paramsList = matchListC[2].split(',').map(function(param) {
      return {name: param.trim()};
    });
    paramsList = paramsList[0].name === '' ? [] : paramsList;
    var obj = {
      functionName: matchListC[1],
      params: paramsList,
      returns: [],
      explanations: {
        descriptions: '',
        examples: '',
        tips: ''
      },
      classContext: '',
      index: matchListC.index
    };
    results.push(obj);
    matchListC = pattern.exec(string);
  }
  return results;
};

var parseFunctionPatternD = function(string, pattern) {
  var matchListD = pattern.exec(string);
  var results = [];  
  while (matchListD) {
    var paramsList = matchListD[2].split(',').map(function(param){
      return {'name': param.trim()};
    });
    paramsList = paramsList[0].name === '' ? [] : paramsList;
    var obj = {
      functionName: matchListD[1],
      params: paramsList,
      returns: [],
      explanations: {
        descriptions: '',
        examples: '',
        tips: ''
      },
      classContext: '',
      index: matchListD.index
    };
    results.push(obj);
    matchListD = pattern.exec(string);
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

//remove entries the user does not wish to include
var removeExcludedEntries = function(parsedObj) {
  var functions = parsedObj.body;
  var resultBody = [];
  //include all that are not marked with @omit
  if (parsedObj.header.includeByDefault === 'true') {
    for (var i = 0; i < functions.length; i++) {
      //skip current function if it has @omit
      if (functions[i].omit !== undefined) {
        continue;
      }
      resultBody.push(functions[i]);
    }
  //else, only include those marked with @include 
  } else {
    for (var i = 0; i < functions.length; i++) {
      //skip current function if it does not have include
      if (functions[i].include === undefined) {
        continue;
      }
      resultBody.push(functions[i]);
    }
  }
  parsedObj.body = resultBody;
};

var findHeader = function(string) {
  var headerRegex = /\/\*{2}\s*@header(?:[\s\S]+?)?\*\//;
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
  //OLD VERSION OF REGEX
  //var blockRegex = /\/\*{1}\s*@doc([\s\S]+?)?\*\//g;

  //any blocks that start with /** and do not contain @header
  var blockRegex = /\/\*{2}(?![\S\s]*@header)([\s\S]*?)\*\//g;
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

// {foo: bar, faz: function()}
// var func = function(a)
// function func(a)
var parseCommentBlock = function(commentBlock, isHeader) {

  //@functionName:
  // @params: '...stuff...' 
  //                   @description: '....');
  //trim off /** and */
  commentBlock = commentBlock.substring(3, commentBlock.length - 2);
  commentBlock = commentBlock.trim();
  //trimming off '@header'
  if (isHeader) {
    commentBlock = commentBlock.substring(7);
  }  
  // } else {
  //   commentBlock = commentBlock.substring(4);
  // }
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

module.exports = {
  parseFunctionPatternA: parseFunctionPatternA,
  parseFunctionPatternB: parseFunctionPatternB,
  parseFunctionPatternC: parseFunctionPatternC,
  parseFunctionPatternD: parseFunctionPatternD,
  parseCommentBlock: parseCommentBlock,
  properties: properties,
  processEntry: processEntry,
  processContentlessEntry: processContentlessEntry,
  convertToJS: convertToJS,
  parseString: parseString,
  splitEntries: splitEntries,
  constructGroupClassAndIndex: constructGroupClassAndIndex,
  buildExplanations: buildExplanations,
  removeExcludedEntries: removeExcludedEntries,
  findHeader: findHeader,
  findCommentBlocks: findCommentBlocks
};