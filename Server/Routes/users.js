var express = require('express');
var router = express.Router();
var handlers = require('../Utilities/requestHandlers');
var passport = require('passport');

router.post('/', passport.authenticate('bearer', {session: false}), function(req, res, next) {
  console.log('successfully authenticated for post request');
  res.end('woohoo');
});

router
  // .get('/login', handlers.loginGetHandler) // Used for our testing page
  .post('/login', handlers.loginPostHandler);

router
  // .get('/register', handlers.registerGetHandler) // used for testing page
  .post('/register', handlers.registerPostHandler);

router.post('/logout', handlers.logoutHandler);

router.get('/github', passport.authenticate('github'));

router.get('/github/callback', handlers.githubLoginPostHandler);

module.exports = router;
