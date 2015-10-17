var helpers = require('./helpers');

exports.apiGet = function(req, res){
  log("helpers", helpers);
  var apiPath = req.url;
  helpers.parseApiPath(apiPath, helpers.testCallback, res);
};