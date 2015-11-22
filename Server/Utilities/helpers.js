var methodsDB = require('../Databases/Models/methods.js');
var passport = require('passport');
var jwt = require('jwt-simple');

if (!process.env.TOKEN_SECRET) {
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
  res.status(404).send(errorMessageOrObj);
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

var convertToDBForm = exports.convertToDBForm = function(projectName, skeleObj, username) {
  var dbForm = {
    project: projectName,
    functionName: skeleObj.functionName,
    group: skeleObj.group,
    username: username,
    timestamp: new Date(),
    reference: {
      params: skeleObj.params,
      returns: skeleObj.returns
    },
    explanations: {descriptions: [], examples: [], tips:[]}
  };
  return dbForm;
};

var runAfterAsync = exports.runAfterAsync = function(res, numOfCallbacks) {
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

var findAndUpdateMethod = exports.findAndUpdateMethod = function(method, completedMethodEntry, skull, username) {
  var searchObj = {
    project: skull.project,
    functionName: method.functionName
  };

  // replacement using helper
  var cb = {

    success: function(foundMethod) {
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
              username: username,
              text: newEntryText,
              upvotes: 0,
              upvoters: {},
              comments: [],
              entryID: hashCode(newEntryText),
              timestamp: new Date()
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
      (new methodsDB(convertToDBForm(skull.project, method, username))).save(function(err, newMethod){
        if(err){
          completedMethodEntry(err);
        } else {
          cb.success(newMethod);
        }
      });
    },

    error: function(err) {
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
    if (err) { console.log('error loggin'); }
    if (!user) {
      return res.sendStatus(401);
    }
    var token = jwt.encode({
      username: user.username,
      expiration: calculateTokenExpiration(),
      session: user.session
    }, process.env.TOKEN_SECRET || authConfig.tokenSecret);
    res.send({access_token: token});
  })(req, res, next);
};

var calculateTokenExpiration = exports.calculateTokenExpiration = function() {
  var timeInHours = 24;
  var timeInMilliseconds = timeInHours * 3600000;
  return Date.now() + timeInMilliseconds;
};







var fieldsCheck = {

  commonFields: ['username', 'project', 'functionName', 'context'],

  additional: {
    upvote: ['entryID'],
    add: ['text'],
    edit: ['text', 'entryID'],
    delete: ['entryID']
  },

  fieldIsInvalid: function(field, value) {
    if (field === 'entryID' || field === 'commentID') {
      if (typeof value === 'number' && value > 0 && Number.isInteger(value)) {
        return false;
      }
    } else {
      if (typeof value === 'string' && value.trim()) {
        return false;
      }
    }
    return true;
  },

  findInvalidFields: function(reqBody, action) {
    var requiredFields = this.commonFields.concat(this.additional[action]);
    var invalidFields = requiredFields.filter(function(field) {
      return this.fieldIsInvalid(field, reqBody[field]);
    }.bind(this));
    if (invalidFields.length) {
      return 'Required fields missing or invalid: ' + invalidFields.join(', ');
    } else {
      return null;
    }
  }
};

var addNewPost = function(entries, username, newText, isComment) {
  var idType = isComment ? 'commentID' : 'entryID';
  var newPostID = hashCode(newText);
  var existingIDs = {};
  for (var i = 0; i < entries.length; i++) {
    if (entries[i].text === newText) {
      return 'duplicate entry';
    }
    existingIDs[entries[i][idType]] = true;
  }
  while (existingIDs[newPostID]) {
    newPostID++;
  }
  var newEntry = {
    username: username,
    timestamp: new Date(),
    text: newText,
    upvotes: 0,
    upvoters: {},
  };
  newEntry[idType] = newPostID;
  if (!isComment) {
    newEntry.comments = [];
  }
  entries.push(newEntry);
  return null;
};

var postToExistng = {

  upvote: function(entries, ind, username) {
    var entry = entries[ind];
    if (!entry.upvoters.hasOwnProperty(username) && username !== entry.username) {
      entry.upvotes++;
      // 1 is arbitrarily selected to indicate that a
      // user has upvoted this entry
      entry.upvoters[username] = 1;
      while (ind > 0 && entry.upvotes > entries[ind -1].upvotes) {
        entries[ind] = entries[ind - 1];
        entries[ind - 1] = entry;
        ind--;
      }
      return null;
    }
    return 'cannot vote more than once or for your own entry';
  },

  edit: function(entries, ind, username, text) {
    var entry = entries[ind];
    if (username === entry.username) {
      if (entry.text === text) {
        return 'no change in content found';
      }
      for (var i = 0; i < entries.length; i++) {
        if (entries[i].text === text) {
          return 'duplicate entry';
        }
      }
      entry.text = text;
      return null;
    }
    return 'not authorized to edit this entry';
  },

  delete: function(entries, ind, username) {
    if (username === entries[ind].username) {
      entries.splice(ind, 1);
      return null;
    }
    return 'not authorized to delete this entry';
  }
};

var indexOfID = function(entries, ID, isComment) {
  var idType = isComment ? 'commentID' : 'entryID';
  for (var ind = 0; ind < entries.length; ind++) {
    if (entries[ind][idType] === ID) {
      return ind;
    }
  }
  return -1;
};

var postToEntry = exports.postToEntry = function(reqBody, action, res) {

  var fieldsError = fieldsCheck.findInvalidFields(reqBody, action);
  if (fieldsError) {
    send404(res, fieldsError);
    return;
  }

  var searchObject = {
    project: reqBody.project,
    functionName: reqBody.functionName
  };

  // mongoFind(res, searchObj, sortObj, successC, notFoundC, errorC)
  mongoFind(res, searchObject, null, function(reference) {
    var explanations = JSON.parse(JSON.stringify(reference.explanations));
    var entries = explanations[reqBody.context];
    if (!entries) {
      send404(res, 'context not found for this function');
      return;
    }

    var username = reqBody.username;
    var text = reqBody.text; // may be undefined for upvote, delete
    var entryID = reqBody.entryID; // may be undefined for add
    var commentID = reqBody.commentID; // may be undefined

    var newPost = (action === 'add');

    if (newPost) {
      if (fieldsCheck.fieldIsInvalid('entryID', entryID)) {
        entryID = null;
      }
      commentID = null;
    } else { // if !newPost
      if (fieldsCheck.fieldIsInvalid('commentID', commentID)) {
        commentID = null;
      }
    }

    var postErr;

    if (entryID) { // always true when !newPost
      var entInd = indexOfID(entries, entryID);
      if (entInd === -1) {
        send404(res, 'entry not found');
        return;
      }
      var entry = entries[entInd];
      var comments = entry.comments;
      if (newPost) {
        postErr = addNewPost(comments, username, text, true);
      } else if (commentID) { // && !newPost
        var comInd = indexOfID(comments, commentID, true);
        if (comInd === -1) {
          send404(res, 'comment not found');
          return;
        }
        postErr = postToExistng[action](comments, comInd, username, text);
      } else { // if !newPost && !commentID
        postErr = postToExistng[action](entries, entInd, username, text);
      }
    } else { // if !entryID
      postErr = addNewPost(entries, username, text);
    }

    if (postErr) {
      send404(res, postErr);
      return;
    }

    // Mongoose will not save the modifications to the explanations object
    // unless you reassign its value to a different object
    reference.explanations = explanations;

    reference.save(function(err) {
      if (err) {
        send404(res, err);
      } else {
        res.sendStatus(202);
      }
    });
  });
};