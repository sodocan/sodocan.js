var express = require('express');
var router = express.Router();
var handlers = require('../Utilities/requestHandlers');
var passport = require('passport');
var jwt = require('jwt-simple');
var authConfig = require('../authenticationConfig');
var User = require('../Databases/Models/users');

router.post('/', passport.authenticate('bearer', {session: false}), function(req, res, next) {
  console.log('successfully authenticated for post request');
  res.end('woohoo');
});
/* GET users listing. */
router.get('/login', handlers.loginGetHandler)
  .post('/login', handlers.loginPostHandler);
  //   function(req, res, next) {
  //   log('post request handler got run');
  //   passport.authenticate('local', {session: false}, function(err, user, info) {
  //     log('callback in passport authenticate got run');
  //     if (err) { console.log('error loggin'); }
  //     if (!user) {
  //       return res.json(401, { error: 'message'} );
  //     }
  //     log('user', user);
  //     var time = 300000;
  //     var token = jwt.encode({
  //       username: user.username,
  //       expiration: Date.now() + time,
  //       session: user.session
  //     }, process.env.tokenSecret || authConfig.tokenSecret);
  //     // log('token', token);
  //     // log('decoded', jwt.decode(token, 'superSecret'));
  //     log('token contents: ',jwt.decode(token, process.env.tokenSecret || authConfig.tokenSecret));
  //     res.json({access_token: token});
  //     //user has authenti
  //     // res.redirect('/');
  //   })(req, res, next);

  // });

router.get('/register', handlers.registerGetHandler)
  .post('/register', handlers.registerPostHandler);

router.post('/logout', function(req, res, next) {

  passport.authenticate('bearer', {session: false}, function(err, user, info) {
    log('bearer callback function got run in logout');
    if (err) {
      console.error(err);
      res.end('error before findOne');
    }
    // User.findOne({username: user.username}).exec(function(err, user) {
    //   if (err) {
    //     console.error(err);
    //     res.end('error in findOne');
    //     return;
    //   }
    //   if (user) {
        user.session++;
        user.save(function(err) {
          if (err) {
            console.error(err);
            return;
          }
          // res.redirect('/auth/login');
          res.end('logged out');
        });
      // } else {
      //   res.end('user not found');
      // }
    // });
  })(req, res, next);

});

router.get('/github', passport.authenticate('github'));

var authenticateFunction = passport.authenticate('github', {
  failureRedirect: '/auth/login'
});

// console.log(authenticateFunction.toString());

router.get('/github/callback', handlers.githubLoginPostHandler);
  // function(req, res, next) {
  // passport.authenticate('github', {session: false}, function(err, user, info) {
  //   log('callback in passport authenticate got run');
  //   if (err) { console.log('error loggin'); }
  //   if (!user) {
  //     return res.json(401, { error: 'message'} );
  //   }
  //   log('user', user);
  //   var time = 300000;
  //   var token = jwt.encode({
  //     username: user.username,
  //     expiration: Date.now() + time,
  //     session: user.session
  //   }, process.env.tokenSecret || authConfig.tokenSecret);
  //   // log('token', token);
  //   // log('decoded', jwt.decode(token, 'superSecret'));
  //   log('token contents: ',jwt.decode(token, process.env.tokenSecret || authConfig.tokenSecret));
  //   res.json({access_token: token});
  // })(req, res, next);

// }
// );

module.exports = router;
