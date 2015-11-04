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
  var methodsArray = skeleton.body;
  var completedMethodEntry = helpers.runAfterAsync(res, methodsArray.length);
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
  console.log('upvote req body', req.body);
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
    log('user', user);
    helpers.createToken(req, res, next, 'local');
  });
};

exports.logoutHandler = function(req, res, next) {
  passport.authenticate('bearer', {session: false}, function(err, user, info) {
    if (err) {
      console.error(err);
      res.end('authentication error');
      return;
    }
    if (!user) {
      res.sendStatus(401);
      return;
    }
    user.session++;
    user.save(function(err) {
      if (err) {
        console.error(err);
        return;
      }
      res.setHeader('Access-Control-Allow-Origin','*');
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
    if (user) {
      req.body.username = user.username;
      next();
    } else {
      res.sendStatus(401);
    }
  })(req, res, next);
}

/* Used for our testing pages only

exports.loginGetHandler = function(req, res, next) {
  console.log('login get received');
  log('__dirname', __dirname);
  var path = __dirname + '/../StaticPages/login.html';
  fs.readFile(path, 'utf8', function(err, html) {
    if (err) {
      console.error(err);
    }
    res.end(html);
  });
};

exports.registerGetHandler = function(req, res, next) {
  console.log('login get received');
  log('__dirname', __dirname);
  var path = __dirname + '/../StaticPages/register.html';
  fs.readFile(path, 'utf8', function(err, html) {
    if (err) {
      console.error(err);
    }
    res.end(html);
  });
};

*/
