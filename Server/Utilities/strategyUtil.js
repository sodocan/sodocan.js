var User = require('../Databases/Models/users.js');
var jwt = require('jwt-simple');

var env = process.env;

if (!env.CLIENT_ID || !env.CLIENT_SECRET || !env.CALLBACK_URL) {
  var authConfig = require('../authenticationConfig');
}

exports.githubStrategyConfig = {
  clientID: env.CLIENT_ID || authConfig.github.clientID,
  clientSecret: env.CLIENT_SECRET || authConfig.github.clientSecret,
  callbackURL: env.CALLBACK_URL || authConfig.github.callbackURL
};

var saveNewGithubUser = function(githubName, done) {
  var user = new User({
    username: githubName + '.git',
  });
  user.save(function(err) {
    if (err) {
      console.error(err);
    } else {
      console.log('saving new user...');
      done(null, user);
    }
  });
};

// defines callback to be used when verifying username and password on login
exports.localStrategyCallback = User.authenticate();

// defines callback to be used when verifying that a github account is valid
exports.githubStrategyCallback = function(accessToken, refreshToken, profile, done) {
  var githubName = profile.username;
  User.findOne({username: githubName + '.git'}, function(err, user) {
    if (err) {
      console.error(err);
      return;
    }
    if (user) {
        console.log('user exists in database');
        done(null, user);
    } else {
      saveNewGithubUser(githubName, done);
    }
  });
};

// defines callback to be used when verifying an authentication token
exports.bearerStrategyCallback = function(token, done) {
  try {
    var decoded = jwt.decode(token, env.TOKEN_SECRET || authConfig.tokenSecret);
  }
  catch(err) {
    return done('Invalid Token');
  }

  if (decoded.expiration < Date.now()) {
    return done('Token Expired',false);
  }
  User.findOne({username: decoded.username, session: decoded.session}, function(err, user) {
    if (err) {
      console.error(err);
      return done(err);
    }
    if (!user) {
      return done(null, false);
    } else {
      return done(null, user);
    }
  });
};
