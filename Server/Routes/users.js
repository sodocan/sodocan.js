var express = require('express');
var router = express.Router();
var handlers = require('../Utilities/requestHandlers');
var passport = require('passport');


router.post('/login', handlers.setCorsHeader, handlers.loginPostHandler);

router.post('/register', handlers.setCorsHeader, handlers.registerPostHandler);

router.post('/logout', handlers.setCorsHeader, handlers.logoutHandler);

router.get('/github', handlers.setCorsHeader, passport.authenticate('github'));

router.get('/github/callback', handlers.setCorsHeader, handlers.githubLoginPostHandler);

module.exports = router;
