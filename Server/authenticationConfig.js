exports.github = {
  clientID: 'cd178d8f86827f00be81',
  clientSecret: '638c511bd0053b544e1ff941ff95ca22a1e678f0',
  callbackURL: 'http://localhost:3000/auth/github/callback'
};

exports.tokenSecret = 'superSecret';

exports.calculateTokenExpiration = function() {
  var timeInHours = 24;
  var timeInMilliseconds = timeInHours * 3600000;
  return Date.now() + timeInMilliseconds;
};