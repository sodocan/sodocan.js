var helpers = require('./helpers');
var methodsDB = require('../Databases/Models/methods');

exports.apiGet = function(req, res){
  log("helpers", helpers);
  var apiPath = req.url;
  helpers.parseApiPath(apiPath, helpers.testCallback, res);
};

//[{header: {}, body:[]},.. ] - body form
exports.postSkeleton = function(req, res) {
  log('postSkeleton got run');
  var skeleton = req.body;
  log('skeleton', skeleton);
  var skull = skeleton.header; // :D
  var methodsArray = skeleton.body;
  for(var i = 0; i < methodsArray.length; i++){
    var method = methodsArray[i];
    //check and see if this method exists already (match proj and method)
      //if it doesn't, convert it to proper mongoForm, then insert

    var searchObj = {
      project: method.project,
      functionName: method.functionName
    };
    log('findOne about to be run');
    methodsDB.findOne(searchObj, function(error, foundMethod) {
      log('findOne got run');
      if (error) {
        log('mongo findOne error');
        console.error(error);
        res.stats(404).end();

      } else if (foundMethod) {
        // then iterate over entries to see if any of them differ
        // from existing ones and add them
        var crowdEntries = method.crowdEntries;
        for (var context in crowdEntries) { //should be changed to explanations
          var newEntryText = crowdEntries[context]; // this is a string
          var existingEntries = foundMethod.crowdEntries[context]; // array
          var match = false;
          for (var j = 0; j < existingEntries.length; j++) {
            existingEntry = existingEntries[j]; // object
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
        /*
        findOne(obj, func(err,found){
          modify found
          update(found)
        })
        */
        methodsDB.update({
          project: foundMethod.project,
          functionName: foundMethod.functionName
        },
        {
          crowdEntries: foundMethod.crowdEntries
        }, function(err){
          if(err){
            console.error(err);

          } else {
            res.sendStatus(202);
          }
        });
        // upsert modified foundMethod to database
          // res.statusCode(202).end() inside callback of database upsert

      } else {
        // convertToDBForm and then insert
          // res.statusCode(202).end() inside callback of database upsert

        (new methodsDB(convertToDBForm(skull.project, method))).save(function(err){
          if(err){
            console.error(err);
          } else {
            res.sendStatus(202);
          }
        });
      }
    });

    //else, check and see if content matches any existing method content
      //if it doesn't match, insert
  }
};

var convertToDBForm = function(projectName, skeleObj){
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
  return hash;
};


// [{
//   projectName: sfjsl,
//   functionName: sdflsj,
//   crowdEntries: {
//     descriptions: 'sfsflksfj',
//   }
// }]

// [{
//   projectName: sfjsl,
//   functionName: sdflsj,
//   crowdEntries: {
//     descriptions: [{
//       text:'werlejrle',
//       votes: 0,
//       additions: [],
//       entryID:
//     }]
//   }
// }]

/*
[{
  "functionName":"baz",
  "params":[
    {
      "name":"grapefruit"
    }
  ]
},
{
  "functionName":"chopsticks",
  "params":[
    {
      "name":""
      }
    ]
  },
  {
    "functionName":"foo","params":
      [
        {
          "name":"obj"
          },
          {"name":"trapezoid"
          }
        ]
      },
      {
      "params":
        [
          {
          "name":"stuff",
          "type":"Boolean"
          }
        ],
      "returns":
        [
          {
            "type":"stuff"
          },
          {
            "type":"num"
          },
          {
            "type":"bool"
          }
        ],
      "functionName":"goldfish",
      "explanations":
      {
        "descriptions":"xtra cheddar",
        "tips":"don't eat too muc"
      }
    },
    {"functionName":"guppy","params":[{"name":"eggs"},{"name":"pie"},{"name":"green"}]},{"params":[{"name":"stuff","type":"Boolean"}],"returns":[{"type":"stuff"},{"type":"num"},{"type":"bool"}],"functionName":"rice","explanations":{"descriptions":"squishy"}},{"functionName":"spicyTuna","params":[{"name":""}]}]
*/