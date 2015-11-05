var express = require('express');
var router = express.Router();
var handlers = require('../Utilities/requestHandlers');
var passport = require('passport');

// This route is for testing only
router.post('/', passport.authenticate('bearer', {session: false}), function(req, res, next) {
  console.log('successfully authenticated for post request');
  res.end('woohoo');
});

router
  // .get('/login', handlers.loginGetHandler) // Used for our testing page
  .post('/login', handlers.setCorsHeader, handlers.loginPostHandler);

router
  // .get('/register', handlers.registerGetHandler) // used for testing page
  .post('/register', handlers.setCorsHeader, handlers.registerPostHandler);

router.post('/logout', handlers.setCorsHeader, handlers.logoutHandler);

router.get('/github', handlers.setCorsHeader, passport.authenticate('github'));

router.get('/github/callback', handlers.setCorsHeader, handlers.githubLoginPostHandler);

module.exports = router;
