var express = require('express');
var router = express.Router();
var handlers = require('../Utilities/requestHandlers');
var passport = require('passport');
var jwt = require('jwt-simple');
var authConfig = require('../authenticationConfig');

router.get('/', passport.authenticate('bearer', {session: false}), function(req, res, next) {
  console.log('Successfully authenticated!');
  console.log(req.user + ' has successfully entered an authenticated route');
  res.redirect('/');
})
.post('/', passport.authenticate('bearer', {session: false}), function(req, res, next) {
  console.log('successfully authenticated for post request');
  res.end('woohoo');
});
/* GET users listing. */
router.get('/login', handlers.loginGetHandler)
  .post('/login', function(req, res, next) {
    log('post request handler got run');
    passport.authenticate('local', {session: false}, function(err, user, info) {
      log('callback in passport authenticate got run');
      if (err) { console.log('error loggin'); }
      if (!user) {
        return res.json(401, { error: 'message'} );
      }
      // log('user', user);
      var token = jwt.encode({username: user.username}, process.env.tokenSecret || authConfig.tokenSecret);
      // log('token', token);
      // log('decoded', jwt.decode(token, 'superSecret'));
      res.json({access_token: token});
      //user has authenti
      // res.redirect('/');
    })(req, res, next);

  });

router.get('/register', handlers.registerGetHandler)
  .post('/register', handlers.registerPostHandler);

router.get('/logout', handlers.logoutHandler);

router.get('/github', passport.authenticate('github'));

var authenticateFunction = passport.authenticate('github', {
  failureRedirect: '/auth/login'
});

// console.log(authenticateFunction.toString());

router.get('/github/callback', function(req, res, next) {
  passport.authenticate('github', {session: false}, function(err, user, info) {
    log('callback in passport authenticate got run');
    if (err) { console.log('error loggin'); }
    if (!user) {
      return res.json(401, { error: 'message'} );
    }
    // log('user', user);
    var token = jwt.encode({username: user.username}, process.env.tokenSecret || authConfig.tokenSecret);
    // log('token', token);
    // log('decoded', jwt.decode(token, 'superSecret'));
    res.json({access_token: token});
    //user has authenti
    // res.redirect('/');
  })(req, res, next);
});

module.exports = router;
