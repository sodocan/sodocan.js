var express = require('express');
var path = require('path');
var favicon = require('serve-favicon'); // currently not used
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var GitHubStrategy = require('passport-github').Strategy;
var authConfig = require('./authenticationConfig');
var expressSession = require('express-session');

//var crowdsourceRouter = require('./Routes/crowdsource');
var usersRouter = require('./Routes/users');
//var createRouter = require('./Routes/create');
var handlers = require('./Utilities/requestHandlers');

var app = express();

// view engine setup
//app.set('views', path.join(__dirname, 'views'));
//app.set('view engine', 'jade');

//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(expressSession({
  secret: 'secret',
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(path.join(__dirname, 'StaticPages'))); // will this be used?

var User = require('./Databases/Models/users.js');
passport.use(new LocalStrategy(User.authenticate()));

passport.use(new GitHubStrategy({
  clientID: authConfig.github.clientID,
  clientSecret: authConfig.github.clientSecret,
  callbackURL: authConfig.github.callbackURL
// }, function(accessToken, refreshToken, profile, done) {
//   console.log('done(): ', done);
//   // process.nextTick(function() {
//   //   return done(null, profile);
//   // });
//   User.findOrCreate({githubId: profile.id}, function(error, user) {
//     console.log('error', error);

//     return done(error, user);
//   });
// }
}, function(accessToken, refreshToken, profile, done) {
    // asynchronous verification, for effect...
    process.nextTick(function () {

    // To keep the example simple, the user's GitHub profile is returned to
    // represent the logged-in user.  In a typical application, you would want
    // to associate the GitHub account with a user record in your database,
    // and return that user instead.
    return done(null, profile);
  });
}));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
// passport.serializeUser(function(user, done) {
//   done(null, user);
// });

// passport.deserializeUser(function(obj, done) {
//   done(null, obj);
// });

// app.use('/users', usersRouter); // might change later to not use router
app.use('/auth', usersRouter);

app.use(function(err, req, res, next) {
  console.log(err);
  console.error(err);
  console.error(new Error('404').stack);
  console.log('next: ', next);
  next();
});

app.get('/api/*', handlers.getApi);
app.post('/create', handlers.postSkeleton);
app.post('/upvote', handlers.upvote);
app.post('/addEntry', handlers.addEntry);

//NOTE: figure out best practices for above route

// TODO: fit this in better, CORS for POSTing
app.options('/*', function(req,res) {
  res.set({
    'Access-Control-Allow-Headers':'Content-Type',
    'Access-Control-Allow-Origin':'*',
  });
  res.end();
});

app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    // res.render('error', {
    //   message: err.message,
    //   error: err
    // });
    res.end();
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  // res.render('error', {
  //   message: err.message,
  //   error: {}
  // });
  res.end();
});



module.exports = app;
