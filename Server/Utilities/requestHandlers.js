var helpers = require('./helpers');

exports.getApi = function(req, res){
  var apiPath = req.url;
  helpers.getReferences(apiPath, helpers.sendReferences, res);
};

//[{header: {}, body:[]},.. ] - body form
exports.postSkeleton = function(req, res) {
  var skeleton = req.body;
  var skull = skeleton.header; // :D
  var methodsArray = skeleton.body;
  var completedMethodEntry = helpers.runAfterAsync(res, methodsArray.length, helpers.mongoUpdateSuccess, helpers.mongoUpdateFailure);
  for(var i = 0; i < methodsArray.length; i++){
    var method = methodsArray[i];
    //check and see if this method exists already (match proj and method)
      //if it doesn't, convert it to proper mongoForm, then insert

    helpers.findAndUpdateMethod(method, completedMethodEntry, skull);

    //else, check and see if content matches any existing method content
      //if it doesn't match, insert
  }
};

exports.upvote = function(req, res) {
  log('upvote handler got run');
  helpers.upvote(req.body, res);
};

exports.addEntry = function(req, res) {
  log('addEntry handler got run');
  helpers.addEntry(req.body, res);
};
