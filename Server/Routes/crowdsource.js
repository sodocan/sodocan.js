var express = require('express');
var router = express.Router();
var handlers = require('../Utilities/requestHandlers');
var methodsDB = require('../Databases/Models/methods.js');


/* GET home page. */
router.get('/*', function(req, res){
  var apiPath = req.url;
  parseApiPath(apiPath, testCallback, res);
});

var parseApiPath = function(path, callback, res) {
  var pathArray = path.split('/');
  var pathArrayPointer = 0;
  var next = function() { //next moves us down the array one
    pathArrayPointer++;
    return pathArray[pathArrayPointer];
  };

  var searchObject = {}; //will be sent through mongoose
  // if (next() !== 'api') {
  //   send404();
  //   return;
  // }
  searchObject.project = next();
  if (!searchObject.project) { //if you didn't give us a project name (just /api)
    send404();
    return;
  }
  var nextPath = next();
  if (nextPath === 'ref') { //if the very next section says ref, we then pull out the method name
    searchObject.methodName = next();//this Means that you are looking for a specif method
    nextPath = next();  //as opposed all methods of a context, or in general (all methods)
  }

  methodsDB.find(searchObject, function(error, references) { //the mongo search
    if (error || !references.length) {
      if(error){
        console.error(error);
      }
      else{
        console.error('found no references');
        send404();
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
var send404 = function(lineNum) {
  log('Got a 404!');
  console.error(new Error('404').stack);
};

var testCallback = function(ref, res){
  log('the references' , ref);
  res.send(ref);
};

//[
//get all top voted entries for all functions / classes / everythign

//get all entries of specific context
//sodocan.com/api/projectName/all/reference
/*
{[
  methodName:
  parameters:
  returns:
]}

*/
//get # of entries of specific context -- method will also be needed
//   /api/projectName/methodName/context/3 || all
//]
//sodocan/projectName/
//[
//get # of additions -- the method, context, and entry will be needed
//may not need method name, as entry has that information associated

//get all addtions
// api/projectName/methodName/context/entry/entryID/3 || all
//]












//post entry -- will need method, and context

//post addition -- will need method, context, and entry * see above note on additions

//post upvote -- will need to know method, context, and entry (or addition, depending on what is upvoted)

//post flag -- for MVP, same as upvote
/*
get single / multiple of each type of context
/entry/?tip=drawPage,drawEntry,%example=
/tip/?
/description/?

entry/tip/?thing1
entry/tip/?thing0

/all/tip

top rated

top 3

all
*/
module.exports = router;


/*
api: required
projectName: if omitted, name of all projects (but nothing else)
methodName: if omitted, give ref of all methods plus top level of each context (no addition by default)
context: if omitted, give top level of each context (no addition by default)
{
  /entry/entrid(number)
  /entryID-034u32/
  /?3
  /3&1
  /?additions=3 (since depth not specified, = 1, additions =3)
  /?d=1&a=1
  /1

} api/projName
api/projName/*all/example

projName/ref/methodName
projName?context=description
projectName/?entryid=3425

api/projName/context-example
api/projNmae/ref-methodName/(entryID-132 or entrydepth)/(add id or add depth)

/projName/method/tip/1/0/examples/descriptions/4/5
api/pojName/description/all/tips/all

api/projName/

contexts = {
 description: true,
 tips: true,

}

save projName in var
if !next
  get all methods with depth 1 addition 0 for all contexts
 else if 'ref'
    then store next in methodName v

var next = next()
if (next === 'ref') {
  var methodName = next();
  next = next();
}

while(next)
  if (next === all) {
    skfjsl
  } else if (next === 'entryID') {
    sfds
  } else if (!isNaN(+next)) {
    sfsdf
  } else {
    var contextName = next
    var depth = 1;
  }
  next = next();
}

ref/meth/all/all
ref/meth/example/all/all

*/