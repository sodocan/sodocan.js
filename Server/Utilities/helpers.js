var methodsDB = require('../Databases/Models/methods.js');

var parseApiPath = exports.parseApiPath = function(path, callback, res) {
  var pathArray = path.split('/');
  var pathArrayPointer = 0;
  var next = function() { //next moves us down the array one
    pathArrayPointer++;
    return pathArray[pathArrayPointer];
  };

  var searchObject = {}; //will be sent through mongoose
  // if (next() !== 'api') {
  //   send404(res);
  //   return;
  // }
  searchObject.project = next();
  if (!searchObject.project) { //if you didn't give us a project name (just /api)
    send404(res);
    return;
  }
  var nextPath = next();
  if (nextPath === 'ref') { //if the very next section says ref, we then pull out the method name
    searchObject.functionName = next();//this Means that you are looking for a specif method
    nextPath = next();  //as opposed all methods of a context, or in general (all methods)
  }

  methodsDB.find(searchObject, function(error, references) { //the mongo search
    if (error || !references.length) {
      if(error){
        console.error(error);
      }
      else{
        console.error('found no references');
        send404(res);
      }
    } else {

      log('references', references);
      var contexts = {};
      var context = 'all'; //setting default context
      do {
        if (!nextPath || nextPath === 'all' || nextPath.slice(0,7) === 'entryID' || !isNaN(+nextPath)) {
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

      log('contexts:', contexts);

      var newReferences = references.map(function(reference) {
        var entriesObj = reference.crowdEntries;
        for (var context in entriesObj) {
          //go through each contexts (not just the ones mentioned)
          //if a specific context is mentioned, use it's depth
          //otherwise use the one specified in all
          depthSpecs = contexts[context] || contexts.all;
          log(depthSpecs);
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
              contextArray = entriesObj[context] = entriesObj[context].slice(0,+entryDepth);
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

      callback(newReferences, res);
    }
  });
};


// This is temporary
var send404 = exports.send404 = function(res) {
  log('Got a 404!');
  console.error(new Error('404').stack);
  res.status(404).end();
};

var testCallback = exports.testCallback = function(ref, res){
  log('the references' , ref);
  res.send(ref);
};


