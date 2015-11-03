var User = require('../Databases/Models/users.js');
var jwt = require('jwt-simple');

var env = process.env;

if (!env.TOKEN_SECRET) {
  var authConfig = require('../authenticationConfig');
}

exports.localStrategyCallback = User.authenticate();

exports.githubStrategyConfig = {
  clientID: env.CLIENT_ID || authConfig.github.clientID,
  clientSecret: env.CLIENT_SECRET || authConfig.github.clientSecret,
  callbackURL: env.CALLBACK_URL || authConfig.github.callbackURL
};

exports.githubStrategyCallback = function(accessToken, refreshToken, profile, done) {
  User.findOne({username: profile.username + '.git'}, function(err, user) {
    if (err) {
      console.error(err);
      return;
    }
    if (user) {
        console.log('user already found in database');
        done(null, user);
    } else {
      var user = new User({
        username: profile.username + '.git',
      });
      user.save(function(err) {
        if (err) {
          console.error(err);
        } else {
          console.log('saving user...');
          done(null, user);
        }
      });
    }
  });
};

exports.bearerStrategyCallback = function(token, done) {
  try {
    var decoded = jwt.decode(token, env.tokenSecret || authConfig.tokenSecret);
    log('decoded',decoded);
    if (decoded.expiration < Date.now()) {
      return done(null, false);
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
  }
  catch(err) {
    return done(null, false);
  }
};
