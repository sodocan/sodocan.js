var express = require('express');
var router = express.Router();
var handlers = require('../Utilities/requestHandlers');
var passport = require('passport');

router.get('/', function(req, res, next) {
  console.log('gotcha!');
  res.sendStatus(202);
  res.end();
});
/* GET users listing. */
router.get('/login', handlers.loginGetHandler)
  .post('/login', passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/login'
}), handlers.loginPostHandler);

// router.get('/register', handlers.registerGetHandler)
//   .post('/register', handlers.registerPostHandler);

module.exports = router;
