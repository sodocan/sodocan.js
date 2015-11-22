var User = require('../Databases/Models/users.js');
var passport = require('passport');
var authTokenHelpers = require('./authTokenHelpers');


exports.registerPostHandler = function(req, res, next) {
  if (req.body.username.substring(req.body.username.length - 4) === '.git') {
    res.status(400).send('illegal username (cannot end in .git)');
  }
  User.register(new User({username: req.body.username}), req.body.password, function(err, user) {
    if (err) {
      res.status(400).send(err);
      return;
    }
    authTokenHelpers.createToken(req, res, next, 'local');
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
  authTokenHelpers.createToken(req, res, next, 'local');
};

exports.githubLoginPostHandler = function(req, res, next) {
  authTokenHelpers.createToken(req, res, next, 'github');
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
