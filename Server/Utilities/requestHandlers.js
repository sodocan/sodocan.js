var helpers = require('./helpers');
var fs = require('fs');
var User = require('../Databases/Models/users.js');
var passport = require('passport');

exports.getApi = function(req, res){
  var apiPath = req.url;
  helpers.getReferences(apiPath, res);
};

//[{header: {}, body:[]},.. ] - body form
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
      res.sendStatus(400);
      res.end('no function names for any of the functions');
      return;
    }
    var completedMethodEntry = helpers.runAfterAsync(res, methodsArray.length);
    for(var i = 0; i < methodsArray.length; i++){
      var method = methodsArray[i];
      //check and see if this method exists already (match proj and method)
        //if it doesn't, convert it to proper mongoForm, then insert

      helpers.findAndUpdateMethod(method, completedMethodEntry, skull, username);

      //else, check and see if content matches any existing method content
        //if it doesn't match, insert
    }
  } else {
    res.sendStatus(400);
    res.end('project name is not provided');
  }
};

exports.upvote = function(req, res) {
  helpers.upvote(req.body, res);
};

exports.addEntry = function(req, res) {
  helpers.addEntry(req.body, res);
};

exports.editEntry = function(req, res) {
  helpers.editEntry(req.body, res);
}


exports.registerPostHandler = function(req, res, next) {
  if (req.body.username.substring(req.body.username.length - 4) === '.git') {
    res.sendStatus(400);
    res.end('illegal username (cannot end in .git)');
  }
  User.register(new User({username: req.body.username}), req.body.password, function(err, user) {
    if (err) {
      res.sendStatus(400);
      res.end();
      return;
    }
    helpers.createToken(req, res, next, 'local');
  });
};

exports.logoutHandler = function(req, res, next) {
  passport.authenticate('bearer', {session: false}, function(err, user, info) {
    if (err) {
      if (err === 'Token Expired') {
        res.sendStatus(200);
      } else {
        console.error(err);
        res.send('authentication error');
      }
      return;
    }
    if (!user) {
      res.send('Not logged in');
      return;
    }
    user.session++;
    user.save(function(err) {
      if (err) {
        console.error(err);
        return;
      }
      res.sendStatus(200);
    });
  })(req, res, next);
};

exports.loginPostHandler = function(req, res, next) {
  helpers.createToken(req, res, next, 'local');
};

exports.githubLoginPostHandler = function(req, res, next) {
  helpers.createToken(req, res, next, 'github');
};

exports.checkTokenHandler = function(req, res, next) {
  passport.authenticate('bearer', {session: false}, function(err, user) {
    if (err) {
      console.error(err);
      if (err === 'Invalid Token' || err === 'Token Expired') {
        res.status(401).send(err);
      } else {
        res.status(401).send('Unknown error. Please try again');
      }
      return;
    }
    if (user) {
      req.body.username = user.username;
      next();
    } else {
      res.status(401).send('Not logged in');
    }
  })(req, res, next);
};

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
