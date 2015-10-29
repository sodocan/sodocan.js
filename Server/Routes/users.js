var express = require('express');
var router = express.Router();
var handlers = require('../Utilities/requestHandlers');
var passport = require('passport');

router.get('/', handlers.checkIfAuthenticated, function(req, res, next) {
  console.log('Successfully authenticated!');
  res.redirect('/');
});
/* GET users listing. */
router.get('/login', handlers.loginGetHandler)
  .post('/login', passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/users/login'
}), handlers.loginPostHandler);

router.get('/register', handlers.registerGetHandler)
  .post('/register', handlers.registerPostHandler);

router.get('/logout', handlers.logoutHandler);

router.get('/github',
  passport.authenticate('github'),
  function(req, res) {
    log('github next got run');
});

router.get('/github/callback', passport.authenticate('github', {
  failureRedirect: '/login'
}), function(req, res) {
  log('callback authentication finished and next handler has run');
  res.redirect('/');
});

module.exports = router;
