var express = require('express');
var router = express.Router();
var authHandlers = require('../Utilities/authHandlers');
var passport = require('passport');

// url routes in auth/

router.post('/login', authHandlers.loginPostHandler);

router.post('/register', authHandlers.registerPostHandler);

router.post('/logout', authHandlers.logoutHandler);

router.get('/github', passport.authenticate('github'));

router.get('/github/callback', authHandlers.githubLoginPostHandler);

module.exports = router;
