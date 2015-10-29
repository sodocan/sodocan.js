var helper = require('./parserHelper.js');
var findHeader = helper.findHeader;
var parseFunctionPatternA = helper.parseFunctionPatternA;
var parseFunctionPatternB = helper.parseFunctionPatternB;
var parseFunctionPatternC = helper.parseFunctionPatternC;
var parseFunctionPatternD = helper.parseFunctionPatternD;
var findCommentBlocks = helper.findCommentBlocks;
var parseCommentBlock = helper.parseCommentBlock;
var processEntry = helper.processEntry;
var buildExplanations = helper.buildExplanations;
var removeExcludedEntries = helper.removeExcludedEntries;

// right now does not distinguish between API and helper functions
var parseMain = function(string) {
  // assuming function names are supplied
  var header = parseHeader(string);

  var functionInfo = parseFunctionInfo(string);
  var commentInfo = parseComments(string);
  var combinedInfo = combineInfo(functionInfo, commentInfo);
  var resultsObj = {header: header, body: combinedInfo};
  removeExcludedEntries(resultsObj);
  return resultsObj;
};

var parseHeader = function(string) {
  var header = findHeader(string);
  // console.log('header before processing: ', header);
  var headerObj = {
    project: '',
    author: '',
    version: '',
    includeByDefault: 'true'
  };
  if (header) {
    var entries = parseCommentBlock(header, true);
    entries.forEach(function(entry) {
      var entryObj = processEntry(entry);
      console.log(entryObj);
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

var parseFunctionInfo = function(string) {
  // checks for independent functions: var xyz = function() {}
  // (?!\/{2})
  var functionPatternA = /[\n\r](?!\/{2})\s*(?:var)?\s*([a-zA-Z0-9_]+)\s*=\s*function\(([a-zA-Z0-9_,\s]*)\)/g;
  // checks for independent functions: function xyz() = {}
  var functionPatternB = /[\n\r](?!\/{2})\s*function\s*([a-zA-Z0-9_]+)\s*\(([a-zA-Z0-9_,\s]*)\)/g;
  // checks for obj methods: a.xyz = function() {}
  //var functionPatternC = /[\n\r](?!\/{2})((?:[a-zA-Z0-9_]+\.)+[a-zA-Z0-9_]+)\s*=\s*function\(([a-zA-Z0-9_,\s]*)\)/g;
  var functionPatternC = /[\n\r](?!\/{2})[\t ]*((?:[a-zA-Z0-9_]+\.)+[a-zA-Z0-9_]+)\s*=\s*function\(([a-zA-Z0-9_,\s]*)\)/g;
  // checks for obj methods: var d3 = {xyz: function(){}}
  var functionPatternD = /[\n\r](?!\/{2})(?:(?:var)? *\w* *= *{?\w* *: *\w*, *)* *(\w*) *: *function\(([\w_, ]*)\)/g;
  // and find the object name to be the context

  var functionInfoA = parseFunctionPatternA(string, functionPatternA);
  var functionInfoB = parseFunctionPatternB(string, functionPatternB);
  var functionInfoC = parseFunctionPatternC(string, functionPatternC);
  var functionInfoD = parseFunctionPatternD(string, functionPatternD);
  var functionInfo = functionInfoA.concat(functionInfoB).concat(functionInfoC).concat(functionInfoD);
  // console.log(functionInfo);
  return functionInfo.sort(function(a, b) {
    return a.index > b.index;
  });
};

var combineInfo = function(functionArray, commentArray) {
  var combinedArray = functionArray.concat(commentArray);
  // object that stores all the class constructor names in the document
  var classStore = {};
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
    var current = combinedArray[i];

    // try a match against pattern of method declaration
    // if match, then store classContext in current object
    var classContext = current.functionName.match(/^([a-zA-Z0-9_]+)\./);

    if (classContext) {
      classContext = classContext[1];
    }
    if (classContext && classStore[classContext]) {
      current.classContext = current.classContext || classContext;
    }
    
    //add to results and break if we're on the last element
    if (i === combinedArray.length - 1) {
      results.push(combinedArray[i]);
      break;
    } 
    
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
      //if @class keyword is present, grab the class's name from the following javascript
      //console.log('current class is: ', current.class);
      if (current.class !== undefined) {
        if (current.class === '') {
          current.class = current.functionName;
          console.log('current class is:', current.class);
        }
        classStore[current.class] = current.class;
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

module.exports = {
  parseMain: parseMain,
  parseComments: parseComments,
  parseHeader: parseHeader,
  parseFunctionInfo: parseFunctionInfo,
  combineInfo: combineInfo
};