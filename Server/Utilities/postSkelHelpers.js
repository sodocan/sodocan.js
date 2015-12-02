var dbHelpers = require('./methodsDatabaseHelpers');

// converts object sent by parser into form that will be stored in database
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

// since the parser may send multiple functions from the same project
// in one request, and because each function must be stored separately
// in the database, the trackUpdates function will return a callback
// for each successful database update, and will only send a response
// back to the server when all updates have been successful, or when an
// error occurs with any of the updates
var trackUpdates = exports.trackUpdates = function(res, numOfCallbacks) {
  var finished = 0;
  var failed = false;
  return function(err){
    if(!failed && !err){
     finished++;
      if(finished === numOfCallbacks){
        res.sendStatus(201);
      }
    }
    if(err && !failed){
      failed = true;
      sendErr(res, 500, err);
    }
  };
};

var checkIfEntryIsNew = function(existingEntries, newEntryText) {
  for (var j = 0; j < existingEntries.length; j++) {
    var existingEntry = existingEntries[j];
    if (newEntryText === existingEntry.text) {
      return false;
    }
  }
  return true;
};

var createNewEntry = function(newEntryText, username) {
  return {
    username: username,
    text: newEntryText,
    upvotes: 0,
    upvoters: {},
    comments: [],
    entryID: dbHelpers.hashCode(newEntryText),
    timestamp: new Date()
  };
};

var updateFoundMethod = function(foundMethod, explanations, username) {
  for (var context in explanations) { //should be changed to explanations
    var newEntryText = explanations[context]; // this is a string
    var existingEntries = foundMethod.explanations[context];
    if (newEntryText && checkIfEntryIsNew(existingEntries, newEntryText)) {
      var newEntry = createNewEntry(newEntryText, username);
      existingEntries.push(newEntry);
    }
  }
  return {explanations: foundMethod.explanations};
};

// when parser sends a new document, each function will be queried against
// the database to see if they already exist. If a function exists, then any
// entries that came with the function will be added to that function in the
// database. If the function does not exist, then a new object will be created
// for it and saved in the database.
var findAndUpdateMethod = exports.findAndUpdateMethod = function(method, oneUpdateComplete, skull, username) {
  var searchObj = {
    project: skull.project,
    functionName: method.functionName
  };

  // replacement using helper
  var cb = {

    success: function(foundMethod) {
      var explanations = method.explanations;
      var updateObj = updateFoundMethod(foundMethod, explanations, username);
      dbHelpers.methodsUpdate(searchObj, updateObj, oneUpdateComplete);
    },

    notFound: function() {
      var dbForm = convertToDBForm(skull.project, method, username);
      dbHelpers.methodsCreate(dbForm, oneUpdateComplete, cb.success);
    },

    error: function(err) {
      console.error(err);
      oneUpdateComplete(err);
    }

  };

  // Since the third argument is null, this will use mongo's findOne
  // Parameters: res, searchObj, sortObj, successC, notFoundC, errorC
  dbHelpers.methodsFind(null, searchObj, null, cb.success, cb.notFound, cb.error);
};
