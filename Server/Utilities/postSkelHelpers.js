var dbHelpers = require('./methodsDatabaseHelpers');

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

var findAndUpdateMethod = exports.findAndUpdateMethod = function(method, oneUpdateComplete, skull, username) {
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
              entryID: dbHelpers.hashCode(newEntryText),
              timestamp: new Date()
            };
            existingEntries.push(newEntry);
          }
        }
      }

      var updateObj = {explanations: foundMethod.explanations};

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
