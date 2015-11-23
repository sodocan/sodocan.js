var postToEntryHelpers = require('./postToEntryHelpers');
var getRefHelpers = require('./getRefHelpers');
var postSkelHelpers = require('./postSkelHelpers');

exports.getApi = function(req, res){
  var apiPath = req.url;
  getRefHelpers.getReferences(apiPath, res);
};

exports.postSkeleton = function(req, res) {
  var skeleton = req.body;
  var skull = skeleton.header; // :D
  var unfilteredMethodsArray = skeleton.body;
  var username = skeleton.username;
  if ((typeof skull.project === 'string') && skull.project.trim()) {
    var methodsArray = unfilteredMethodsArray.filter(function(method) {
      return ((typeof method.functionName === 'string') && !!method.functionName.trim());
    });
    if (methodsArray.length === 0) {
      res.status(400).send('no function names for any of the functions');
      return;
    }
    var oneUpdateComplete = postSkelHelpers.trackUpdates(res, methodsArray.length);
    for(var i = 0; i < methodsArray.length; i++){
      var method = methodsArray[i];

      //check and see if this method exists already (match proj and method)
      //if it doesn't, convert it to proper mongoForm, then insert
      //else, update existing method
      postSkelHelpers.findAndUpdateMethod(method, oneUpdateComplete, skull, username);
    }
  } else {
    res.status(400).send('project name is not provided');
  }
};

exports.upvote = function(req, res) {
  postToEntryHelpers.postToEntry(req.body, 'upvote', res);
};

exports.addEntry = function(req, res) {
  postToEntryHelpers.postToEntry(req.body, 'add', res);
};

exports.editEntry = function(req, res) {
  postToEntryHelpers.postToEntry(req.body, req.body.delete ? 'delete' : 'edit', res);
}

// to allow cross-origin requests, since clients are hotsted on another domain
exports.setCorsHeader = function(req, res, next) {
  res.setHeader('Access-Control-Allow-Origin','*');
  next();
};

exports.sendOptionsHeader = function(req, res) {
  res.set({
    'Access-Control-Allow-Headers':'Content-Type',
    'Access-Control-Allow-Origin':'*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
  });
  res.end();
};
