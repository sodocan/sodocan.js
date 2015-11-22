var dbHelpers = require('./methodsDatabaseHelpers');

var parseApiPath = exports.parseApiPath = function(path) {
  var pathArray = path.split('/');
  var pathArrayPointer = 0;
  var next = function() { //next moves us down the array one
    pathArrayPointer++;
    return pathArray[pathArrayPointer];
  };

  if (next() !== 'api') {
    log('must use api word in url');
    return;
  }

  var searchObject = {}; //will be sent through mongoose
  searchObject.project = next();
  if (!searchObject.project) { //if you didn't give us a project name (just /api)
    log('no project name provided');
    return;
  }

  var nextPath = next();
  if (nextPath === 'ref') { //if the very next section says ref, we then pull out the method name
    searchObject.functionName = next();//this Means that you are looking for a specif method
    nextPath = next();  //as opposed all methods of a context, or in general (all methods)
  }

  var contexts = {};
  var context = 'all'; //setting default context
  do {
    if (!nextPath
      || nextPath === 'all'
      || nextPath.slice(0,7) === 'entryID'
      || nextPath.slice(0,9) === 'commentID'
      || !isNaN(+nextPath)) {
      //the first time through, this will put an empty array into context
      //ex (contexts[description] = [])
      contexts[context] = contexts[context] || [];
      if (nextPath) { // not necessary, since will just push undefined to array
        //pushes the depth, comment, all, or entry ID into context
        //{example:[1,all]}
        contexts[context].push(nextPath);
      }
    } else {
      //we've entered a new context, so switch the context for contexts object
      context = nextPath;
      contexts[context] = contexts[context] || [];
    }
    nextPath = next();
  } while (nextPath);

  return {
    searchObject: searchObject,
    contexts: contexts
  };
};

/*
sodocan.com/api/*:projectName/ref/:functionName/:explanationType/:numEntriesOrEntryID/:numCommentsOrCommentID
api/:projectName/1/all
*/
var getReferences = exports.getReferences = function(path, res) {

  var parsedPath = parseApiPath(path);
  if (!parsedPath) {
    sendErr(res, 400, 'Invalid path');
    return;
  }

  // Parameters: res, searchObj, sortObj, successC, notFoundC, errorC
  dbHelpers.methodsFind(res, parsedPath.searchObject, {functionName: 1}, function(references) {
    var contexts = parsedPath.contexts;

    var newReferences = references.map(function(reference) {
      var entriesObj = reference.explanations;
      for (var context in entriesObj) {
        //go through each contexts (not just the ones mentioned)
        //if a specific context is mentioned, use it's depth
        //otherwise use the one specified in all
        var depthSpecs = contexts[context] || contexts.all;
        if (depthSpecs) {
          //default depth is 1, default addtion is 0
          var entryDepth = depthSpecs[0] || '1';
          var addDepth = depthSpecs[1] || '0';
          var contextArray;
          //the prefix entryID means we are looking for a specific ID
          if (entryDepth.slice(0,7) === 'entryID') {
            id = +entryDepth.slice(8);
            var found = false;
            for (var i = 0; i < entriesObj[context].length; i++) {
              if (entriesObj[context][i].entryID === id) {
                //search the all entries for that method until you find the specific one
                contextArray = entriesObj[context] = [entriesObj[context][i]];
                found = true;
                break;
              }
            }
            if (!found) {
              contextArray = entriesObj[context] = [];
            }

          } else if (entryDepth === 'all') {
            contextArray = entriesObj[context];
          } else { // else entryDepth is a number
            //so we get the n (depth) amount of entries
            contextArray = entriesObj[context] = entriesObj[context].slice(0, +entryDepth);
          }
          //checking to see if we want a specific comment
          //very similar to what we did for entries
          for (var i = 0; i < contextArray.length; i++) {
            if (addDepth.slice(0,9) === 'commentID') {
              id = +addDepth.slice(10);
              var commentsArray = contextArray[i].comments;
              var foundAdd = false;
              for (var j = 0; i < commentsArray.length; j++) {
                if (commentsArray[j].commentID === id) {
                  contextArray[i].comments = [commentsArray[j]];
                  foundAdd = true;
                  break;
                }
              }
              if (!foundAdd) {
                contextArray[i].comments = [];
              }

            } else if(addDepth !== 'all'){
              contextArray[i].comments = contextArray[i].comments.slice(0, +addDepth);
            }
          }
        } else {//if there was no depth, that means we don't want it. delete.

          delete entriesObj[context];
        }
      }
      return reference;
    });

    res.send(newReferences);
  });
};
