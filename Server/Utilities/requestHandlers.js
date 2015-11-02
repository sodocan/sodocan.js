var helpers = require('./helpers');
var fs = require('fs');
var User = require('../Databases/Models/users.js');
var passport = require('passport');

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
  helpers.upvote(req.body, res);
};

exports.addEntry = function(req, res) {
  helpers.addEntry(req.body, res);
};

exports.loginGetHandler = function(req, res, next) {
  console.log('login get received');
  log('__dirname', __dirname);
  var path = __dirname + '/../StaticPages/login.html';
  // console.log('does it exist?', fs.existsSync(path));
  //console.log(res.sendfile);
  //res.sendFile(path);
  fs.readFile(path, 'utf8', function(err, html) {
    if (err) {
      console.error(err);
    }
    //res.sendStatus(200);
    res.end(html);

  });
};

// exports.loginPostHandler = function(req, res, next) {
//   // console.log('login post received ', req);
//   console.log('postHandler got run');
//   log('body', req.body);
//   res.end();
// };

exports.registerGetHandler = function(req, res, next) {
  console.log('login get received');
  log('__dirname', __dirname);
  var path = __dirname + '/../StaticPages/register.html';
  // console.log('does it exist?', fs.existsSync(path));
  //console.log(res.sendfile);
  //res.sendFile(path);
  fs.readFile(path, 'utf8', function(err, html) {
    if (err) {
      console.error(err);
    }
    //res.sendStatus(200);
    res.end(html);
  });
};

exports.registerPostHandler = function(req, res, next) {
  // console.log(req.body);
  if (req.body.username.substring(req.body.username.length - 4) === '.git') {
    res.sendStatus(400);
    res.end('illegal username (cannot end in .git)');
  }
  User.register(new User({username: req.body.username}), req.body.password, function(err, user) {
    if (err) {
      // console.log(err);
      // console.log('registration error!!');
      res.sendStatus(400);
      res.end();
      return;
    }
    log('user', user);
    passport.authenticate('local')(req, res, function() {
      res.redirect('/');
    });
  });
};

exports.checkIfAuthenticated = function(req, res, next) {
  // console.log('is authenticated function: ',req.isAuthenticated.toString());
  if (req.isAuthenticated()) {
    //next(req, res);
    next();
  } else {
    // for now will just redirect, but eventually might want to
    // change it to an error callback for situations where we
    // might not want to redirect to the login page
    res.redirect('/auth/login');
  }
};

exports.logoutHandler = function(req, res, next) {
  // req.logout();
  //log('request', req);
  log('request.user', req.user);
  //var reqString = JSON.stringify(req);
  //log('matches for username: ', reqString.match('124'));
  User.findOne({username: req.user.username}).exec(function(err, user) {
    if (err) {
      console.error(err);
      return;
    }
    if (user) {
      user.session++;
      user.save(function(err) {
        if (err) {
          console.error(err);
          return;
        }
        // res.redirect('/auth/login');
        res.end('logged out');
      });
    }
  });
};

exports.loginPostHandler = function(req, res, next) {
  helpers.createToken(req, res, next, 'local');
};

exports.githubLoginPostHandler = function(req, res, next) {
  helpers.createToken(req, res, next, 'github');
};