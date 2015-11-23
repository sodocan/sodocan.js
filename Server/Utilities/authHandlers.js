var User = require('../Databases/Models/users.js');
var passport = require('passport');
var authTokenHelpers = require('./authTokenHelpers');

// When user registers for a local account (not through Github)
// Will create new user in Users database
exports.registerPostHandler = function(req, res, next) {
  if (req.body.username.substring(req.body.username.length - 4) === '.git') {
    res.status(400).send('illegal username (cannot end in .git)');
  }
  // User.register will send error if requested username is already
  // taken by an existing user. Otherwise, it creates the user and
  // creates a login token
  User.register(new User({username: req.body.username}), req.body.password, function(err, user) {
    if (err) {
      res.status(400).send(err);
      return;
    }
    authTokenHelpers.createToken(req, res, next, 'local');
  });
};

// When user logs out, the session number will increment in the Users
// database so that the old token will become invalid.
// Will not log out if user not logged in (unless due to token expiration),
// to prevent a third party from maliciously logging users out
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

// checks that username and password are correct, then
// sends a login token to the client
exports.loginPostHandler = function(req, res, next) {
  authTokenHelpers.createToken(req, res, next, 'local');
};

// same as above, but
// for users who log in through their github account
// rather than an account they created with us
exports.githubLoginPostHandler = function(req, res, next) {
  authTokenHelpers.createToken(req, res, next, 'github');
};

// when users post to entries or make requests that require
// them to be logged in, the client must send the token that
// it received upon login, and this handler will check that the
// token is valid before proceeding with the request
exports.checkTokenHandler = function(req, res, next) {
  passport.authenticate('bearer', {session: false}, function(err, user) {
    if (err) {
      console.error(err);
      if (err === 'Invalid Token' || err === 'Token Expired') {
        res.status(401).send(err);
      } else {
        res.status(500).send('Unknown error. Please try again');
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
