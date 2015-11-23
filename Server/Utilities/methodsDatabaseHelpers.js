var methodsDB = require('../Databases/Models/methods.js');

// successC (required), notFoundC, and errorC are all callback functions
// successC takes the found reference as a parameter
// errorC takes the error as a parameter
// if sortObj is null, then findOne is used instead of find
exports.methodsFind = function(res, searchObj, sortObj, successC, notFoundC, errorC) {
  notFoundC = notFoundC || function() {sendErr(res, 404, 'reference not found');};
  errorC = errorC || function(err) {sendErr(res, 500, err);};

  var finder = sortObj
    ? methodsDB.find(searchObj).sort(sortObj).lean()
    : methodsDB.findOne(searchObj);

  finder.exec(function(error, references) {
    if (error) {
      errorC(error);
    } else if (sortObj ? !references.length : !references) {
      notFoundC();
    } else {
      successC(references);
    }
  });
};

// callback will get passed error if any, and will be called
// without arguments if no error
exports.methodsUpdate = function(searchObj, updateObj, callback) {
  methodsDB.update(searchObj, updateObj, function(err) {
    if (err) {
      callback(err);
    } else {
      callback();
    }
  });
};

exports.methodsCreate = function(data, errorCallback, successCalback) {
  (new methodsDB(data)).save(function(err, newlyCreatedData){
    if(err){
      errorCallback(err);
    } else {
      successCalback(newlyCreatedData);
    }
  });
};

// Generates the entryID or commentID that will be used
// to identify entries/comments in the database
exports.hashCode = function(string) {
  var hash = 0, i, chr, len;
  if (string.length === 0){
   return hash;
  }
  for (i = 0, len = string.length; i < len; i++) {
    chr   = string.charCodeAt(i);
    hash  = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return Math.abs(hash);
};
