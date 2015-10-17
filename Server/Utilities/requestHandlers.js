var helpers = require('./helpers');
var methodsDB = require('../Databases/Models/methods');

exports.apiGet = function(req, res){
  log("helpers", helpers);
  var apiPath = req.url;
  helpers.parseApiPath(apiPath, helpers.testCallback, res);
};

exports.postSkeleton = function(req, res) {
  var methodsArray = JSON.parse(req.body);
  for(var i = 0; i < methodsArray; i++){
    var method = methodsArray[i];
    //check and see if this method exists already (match proj and method)
      //if it doesn't, convert it to proper mongoForm, then insert

    var searchObj = {
      project: method.project,
      methodName: method.methodName
    };

    methodsDB.findOne(searchObj, function(error, foundMethod) {
      if (foundMethod) {
        // then iterate over entries to see if any of them differ
        // from existing ones and add them
        var crowdEntries = method.crowdEntries;
        for (var context in crowdEntries) { //should be changed to explanations
          var newEntries = crowdEntries[context];
          var existingEntries = foundMethod.crowdEntries[context];
          for (var i = 0; i < newEntries.length; i++) {
            var match = false;
            for (var j = 0; j < existingEntries.length; j++) {
              newEntry = newEntries[i];
              existingEntry = existingEntries[j];
              if (newEntry.text === existingEntry.text) {
                match = true;
                break;
              }
            }
            if (!match) {
              // make sure to add 0 upvotes and 0 flags and a unique ID to entry
              existingEntries.push(newEntry);
            }
          }
        }
        // upsert modified foundMethod to database
          // res.statusCode(202).end() inside callback of database upsert
      } else {
        // convertToDBForm and then insert
          // res.statusCode(202).end() inside callback of database upsert
      }
    });

    //else, check and see if content matches any existing method content
      //if it doesn't match, insert
  }
};
var convertToDBForm = function(skeleObj){

  return dbForm;
};
