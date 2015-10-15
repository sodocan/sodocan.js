var fs = require('fs');

//consider including more specific types of description: params description, returns description
//maybe we don't need 'name' for the 'returns' array
exports.properties = properties = {
  'functionName': '',
  'params': [],
  'returns': [],
  'group': '',
  'description': '',
  'example': '',
  'tips': ''
};

exports.parserMain = parserMain = function(string) {
  // fs.readFile(filePath, function(err, data) {
  var results = [];  
  var blocks = findCommentBlocks(string);
  blocks.forEach(function(block) {
    var blockObj = {};
    var entries = parseCommentBlock(block);
    entries.forEach(function(entry) {
      var entryObj = processEntry(entry);
      blockObj[entryObj.propertyName] = entryObj.content;
    });
    results.push(blockObj);
  }); 
  return results;
};

exports.findCommentBlocks = findCommentBlocks = function(string) {
  //search the string for a substring beginning with /* and ending with */
  // right now assumes @doc is the first thing in the block after 0 or more white spaces
  // but not other chars
  var blockRegex = /\/\*{1}(\s*?)@doc([\s\S]+?)?\*\//g;
  return string.match(blockRegex);
};

exports.parseCommentBlock = parseCommentBlock = function(commentBlock) {
  //@functionName:
  // @params: '...stuff...' 
  //                   @description: '....'
  commentBlock = commentBlock.substring(2, commentBlock.length - 2);
  commentBlock = commentBlock.trim();
  commentBlock = commentBlock.substring(4);
  commentBlock = commentBlock.trim();
  commentBlock = commentBlock.substring(1);
  // check if matches pattern: [\n\r]\s*@; if so, there are multiple entries
  //if there are multiple entries
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

exports.processEntry = processEntry = function(entry) {
  //grab property name (in between @ and :)
  //grab contents after colon

  var propNameRegex = /^\w+?:/; 
  var nameOfProperty = entry.match(propNameRegex).join();
  var propNameLength = nameOfProperty.length;
  nameOfProperty = nameOfProperty.substring(0, propNameLength - 1).trim();
  if  (!propertyIsValid(nameOfProperty)) {
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

exports.convertToJS = convertToJS = function(string) {
  var fixedJSON = string.replace(/(['"])?([a-zA-Z0-9_]+)(['"])?\s*:/g, '"$2": ');
  fixedJSON = fixedJSON.replace(/:\s*(['])([^']+)(['])/g, ':"$2"');
  return JSON.parse(fixedJSON); 
};

// first char is neither [ or {
  // check if first char is ' 
    // find double quotes (unescaped) 
      // escape them and replace them with single quotes  replace " with \'
    // replace head and tail with double quotes 

exports.parseString = parseString = function(string) {
  if (string[0] === "'") {
    string = string.replace(/"/g, "\'");
    string = '"' + string.substring(1, string.length - 1) + '"';
  }
  return JSON.parse(string);
};

exports.splitEntries = splitEntries = function(string) {
  var entryDividingRegex = /[\r\n]\s*@/g;
  return string.split(entryDividingRegex);
};

//todo: make less tightly coupled (don't use side effects to set properties obj, do it in
// main )

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