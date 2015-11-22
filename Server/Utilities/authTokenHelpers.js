var passport = require('passport');
var jwt = require('jwt-simple');
if (!process.env.TOKEN_SECRET) {
  var authConfig = require('../authenticationConfig');
}

var createToken = exports.createToken = function(req, res, next, authenticateType) {
  passport.authenticate(authenticateType, {session: false}, function(err, user) {
    if (err) {
      res.sendStatus(500);
      return;
    }
    if (!user) {
      res.sendStatus(401);
      return;
    }
    var token = jwt.encode({
      username: user.username,
      expiration: calculateTokenExpiration(),
      session: user.session
    }, process.env.TOKEN_SECRET || authConfig.tokenSecret);
    res.send({access_token: token});
  })(req, res, next);
};

var calculateTokenExpiration = function() {
  var timeInHours = 24;
  var timeInMilliseconds = timeInHours * 3600000;
  return Date.now() + timeInMilliseconds;
};
