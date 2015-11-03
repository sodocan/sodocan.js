var methodsDB = require('../Databases/Models/methods.js');
var passport = require('passport');
var jwt = require('jwt-simple');

if (!process.env.tokenSecret) {
  var authConfig = require('../authenticationConfig');
}

/* Server Response Actions */

var send404 = exports.send404 = function(res, errorMessageOrObj) {
  if (typeof errorMessageOrObj === 'string') {
    log('Error', errorMessageOrObj);
  } else {
    console.error(errorMessageOrObj);
  }
  console.error(new Error('404').stack);
  res.status(404).end();
};

/* Database Actions */

// successC (required), notFoundC, and errorC are all callback functions
// successC takes the found reference as a parameter
// errorC takes the error as a parameter
// if sortObj is null, then findOne is used instead of find
var mongoFind = function(res, searchObj, sortObj, successC, notFoundC, errorC) {
  notFoundC = notFoundC || function() {send404(res, 'reference not found');};
  errorC = errorC || function(err) {send404(res, err);};

  var finder = sortObj
    ? methodsDB.find(searchObj).sort(sortObj)
    : methodsDB.findOne(searchObj);

  finder.lean().exec(function(error, references) {
    if (error) {
      errorC(error);
    } else if (sortObj ? !references.length : !references) {
      notFoundC();
    } else {
      successC(references);
    }
  });
};

/* Other Helpers */

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
      || nextPath.slice(0,10) === 'additionID'
      || !isNaN(+nextPath)) {
      //the first time through, this will put an empty array into context
      //ex (contexts[description] = [])
      contexts[context] = contexts[context] || [];
      if (nextPath) { // not necessary, since will just push undefined to array
        //pushes the depth, addition, all, or entry ID into context
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

var convertToDBForm = exports.convertToDBForm = function(projectName, skeleObj){
  var explanations = {};
  for(var context in skeleObj.explanations){
    explanations[context] = [];
    if(skeleObj.explanations[context]){
      explanations[context].push({
        text: skeleObj.explanations[context],
        upvotes: 0,
        additions: [],
        entryID: hashCode(skeleObj.explanations[context])
      });
    }
  }

  var dbForm = {
    project: projectName,
    functionName: skeleObj.functionName,
    group: skeleObj.group,
    reference: {
      params: skeleObj.params,
      returns: skeleObj.returns
    },
    explanations: explanations
  };
  return dbForm;
};

var runAfterAsync = exports.runAfterAsync = function(res, numOfCallbacks){
  var finished = 0;
  var failed = false;
  return function(err){
    if(!failed && !err){
     finished++;
      if(finished === numOfCallbacks){
        res.sendStatus(202);
      }
    }
    if(err && !failed){
      failed = true;
      // error(res, err);
      send404(res, err);
    }
  };
};

var hashCode = function(string) {
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

/* Uncategorized so far */
/*
sodocan.com/api/*:projectName/ref/:functionName/:explanationType/:numEntriesOrEntryID/:numCommentsOrCommentID
api/:projectName/1/all
*/
var getReferences = exports.getReferences = function(path, res) {
  console.log('getReferences got run');

  var parsedPath = parseApiPath(path);
  if (!parsedPath) {
    send404(res, 'Path parsing failed');
    return;
  }

  // mongoFind(res, searchObj, sortObj, successC, notFoundC, errorC)
  mongoFind(res, parsedPath.searchObject, {functionName: 1}, function(references) {
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
          //checking to see if we want a specific addition
          //very similar to what we did for entries
          for (var i = 0; i < contextArray.length; i++) {
            if (addDepth.slice(0,10) === 'additionID') {
              id = +addDepth.slice(11);
              var additionsArray = contextArray[i].additions;
              var foundAdd = false;
              for (var j = 0; i < additionsArray.length; j++) {
                if (additionsArray[j].additionID === id) {
                  contextArray[i].additions = [additionsArray[j]];
                  foundAdd = true;
                  break;
                }
              }
              if (!foundAdd) {
                contextArray[i].additions = [];
              }

            } else if(addDepth !== 'all'){
              contextArray[i].additions = contextArray[i].additions.slice(0, +addDepth);
            }
          }
        } else {//if there was no depth, that means we don't want it. delete.

          delete entriesObj[context];
        }
      }
      return reference;
    });

    res.setHeader('Access-Control-Allow-Origin','*');
    res.send(newReferences);
  });
};

var upvote = exports.upvote = function(upvoteInfo, res) {
  /*
  {
    project:
    functionName:
    context:
    entryID:
    [additionID:]
    [username/ip:]
  }
  */
  var searchObject = {
    project: upvoteInfo.project,
    functionName: upvoteInfo.functionName
  };

  if (!searchObject.project || !searchObject.functionName) {
    send404(res, 'project or functionName not provided');
    return;
  }

  // mongoFind(res, searchObj, sortObj, successC, notFoundC, errorC)
  mongoFind(res, searchObject, null, function(reference) {
    var context = upvoteInfo.context;
    var entryID = upvoteInfo.entryID;

    var addition = false;

    var additionID = upvoteInfo.additionID;
    if (additionID) {
      addition = true;
    }

    var entryFound = false;
    var contextArray = reference.explanations[context];
    if (!contextArray) {
      send404(res, 'context not found');
      return;
    }
    for (var i = 0; i < contextArray.length; i++) {
      if (contextArray[i].entryID === entryID) {
        entryFound = true;
        if(!additionID){
          contextArray[i].upvotes++;

          while (i > 0 && contextArray[i].upvotes > contextArray[i-1].upvotes) {
            var temp = contextArray[i];
            contextArray[i] = contextArray[i-1];
            contextArray[i-1] = temp;
            i--;
          }
        } else {
          var additionFound = false;
          var additions = contextArray[i].additions;
          for (var j = 0; j < additions.length; j++) {
            if (additions[j].additionID === additionID) {
              additionFound = true;
              additions[j].upvotes++;
              while (j > 0 && additions[j].upvotes > additions[j-1].upvotes) {
                var temp = additions[j];
                additions[j] = additions[j-1];
                additions[j-1] = temp;
                j--;
              }
              break;
            }
          }
          if (!additionFound) {
            send404(res, 'additionID not found');
            return;
          }
        }
        break;
      }
    }
    if (!entryFound) {
      send404(res, 'entryID not found');
      return;
    }

    methodsDB.update(searchObject, {explanations: reference.explanations}, function(error, response) {
      if (error) {
        send404(res, error);
      } else {
        res.setHeader('Access-Control-Allow-Origin','*');
        res.sendStatus(202);
      }
    });
  });
};

var addEntry = exports.addEntry = function(addEntryInfo, res) {
  /*
  {
    project:
    functionName:
    context:
    text:
    [entryID:]
    [username/ip:]
  }
  */
  var searchObject = {
    project: addEntryInfo.project,
    functionName: addEntryInfo.functionName
  };

  if (!searchObject.project || !searchObject.functionName) {
    send404(res, 'project or functionName not provided');
    return;
  }

  // mongoFind(res, searchObj, sortObj, successC, notFoundC, errorC)
  mongoFind(res, searchObject, null, function(reference) {
    var context = addEntryInfo.context;
    var contextArray = reference.explanations[context];
    if (!contextArray) {
      send404(res, 'context not found');
      return;
    }
    var id = hashCode(addEntryInfo.text);

    var entryID = addEntryInfo.entryID;
    if (entryID) {
      var entryFound = false;
      for (var i = 0; i < contextArray.length; i++) {
        if (contextArray[i].entryID === entryID) {
          entryFound = true;
          for (var j = 0; j < contextArray[i].additions.length; j++) {
            if (contextArray[i].additions[j].additionID === id) {
              send404(res, 'duplicate entry');
              return;
            }
          }
          var addition = {
            additionID: id,
            timestamp: new Date(),
            text: addEntryInfo.text,
            upvotes: 0,
          };
          contextArray[i].additions.push(addition);
          break;
        }
      }
      if (!entryFound) {
        send404(res, 'entryID not found');
        return;
      }
    } else {
      for (var i = 0; i < contextArray.length; i++) {
        if (contextArray[i].entryID === id) {
          send404(res, 'duplicate entry');
          return;
        }
      }
      var entry = {
        entryID: id,
        timestamp: new Date(),
        text: addEntryInfo.text,
        upvotes: 0,
        additions: []
      };
      contextArray.push(entry);
    }

    methodsDB.update(searchObject, {explanations: reference.explanations}, function(error, response) {
      if (error) {
        send404(res, error);
      } else {
        res.setHeader('Access-Control-Allow-Origin','*');
        res.sendStatus(202);
      }
    });
  });
};



var findAndUpdateMethod = exports.findAndUpdateMethod = function(method, completedMethodEntry, skull) {
  var searchObj = {
    project: skull.project,
    functionName: method.functionName
  };

  // replacement using helper
  var cb = {

    success: function(foundMethod) {
      log('postSkeleton mongoFindOne success');
      var explanations = method.explanations;
      for (var context in explanations) { //should be changed to explanations
        var newEntryText = explanations[context]; // this is a string
        if (newEntryText) { //only do work if there is text
          var existingEntries = foundMethod.explanations[context]; // array
          var match = false;
          for (var j = 0; j < existingEntries.length; j++) {
            var existingEntry = existingEntries[j]; // object
            if (newEntryText === existingEntry.text) {
              match = true;
              break;
            }
          }
          if (!match) {
            var newEntry = {
              text: newEntryText,
              upvotes: 0,
              additions: [],
              entryID: hashCode(newEntryText)
            };
            existingEntries.push(newEntry);
          }
        }
      }

      methodsDB.update({
        project: foundMethod.project,
        functionName: foundMethod.functionName
      },
      {
        explanations: foundMethod.explanations
      }, function(err){
        if(err){
          completedMethodEntry(err);

        } else {
          completedMethodEntry();
        }
      });
    },

    notFound: function() {
      log('postSkeleton mongoFindOne notFound');
      // convertToDBForm and then insert
      // res.statusCode(202).end() inside callback of database upsert
      (new methodsDB(convertToDBForm(skull.project, method))).save(function(err){
        if(err){
          completedMethodEntry(err);
        } else {
          completedMethodEntry();
        }
      });
    },

    error: function(err) {
      log('postSkeleton mongoFindOne error');
      console.error(err);
      completedMethodEntry(err);
    }

  };

  // Since the third argument is null, this will use mongo's findOne
  // mongoFind(res, searchObj, sortObj, successC, notFoundC, errorC)
  mongoFind(null, searchObj, null, cb.success, cb.notFound, cb.error);
};

var createToken = exports.createToken = function(req, res, next, authenticateType) {
  passport.authenticate(authenticateType, {session: false}, function(err, user) {
    log('callback in passport authenticate got run');
    if (err) { console.log('error loggin'); }
    if (!user) {
      return res.json(401, { error: 'message'} );
    }
    log('user', user);
    var token = jwt.encode({
      username: user.username,
      expiration: calculateTokenExpiration(),
      session: user.session
    }, process.env.tokenSecret || authConfig.tokenSecret);
    res.json({access_token: token});
  })(req, res, next);
};

var calculateTokenExpiration = exports.calculateTokenExpiration = function() {
  var timeInHours = 24;
  var timeInMilliseconds = timeInHours * 3600000;
  return Date.now() + timeInMilliseconds;
};
