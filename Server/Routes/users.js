var express = require('express');
var router = express.Router();
var handlers = require('../Utilities/requestHandlers');
var passport = require('passport');


router.post('/login', handlers.loginPostHandler);

router.post('/register', handlers.registerPostHandler);

router.post('/logout', handlers.logoutHandler);

router.get('/github', passport.authenticate('github'));

router.get('/github/callback', handlers.githubLoginPostHandler);

module.exports = router;
