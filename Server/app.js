var express = require('express');
var path = require('path');
var favicon = require('serve-favicon'); // currently not used
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var GitHubStrategy = require('passport-github').Strategy;
var expressSession = require('express-session'); // still needed?
var BearerStrategy = require('passport-http-bearer').Strategy;

var usersRouter = require('./Routes/users');
var handlers = require('./Utilities/requestHandlers');
var strategyUtil = require('./Utilities/strategyUtil');

var app = express();

// view engine setup
//app.set('views', path.join(__dirname, 'views'));
//app.set('view engine', 'jade');

app.use(favicon(path.join(__dirname, '../public/images', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// not needed anymore?
app.use(expressSession({
  secret: 'secret',
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
// app.use(express.static(path.join(__dirname, 'StaticPages'))); // will this be used?
app.use(express.static(path.join(__dirname, '../public')));

var User = require('./Databases/Models/users.js');
passport.use(new LocalStrategy(strategyUtil.localStrategyCallback));

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

passport.use(new GitHubStrategy(
  strategyUtil.githubStrategyConfig,
  strategyUtil.githubStrategyCallback
));

passport.use(new BearerStrategy(strategyUtil.bearerStrategyCallback));

app.use('/auth', usersRouter);

app.use(function(err, req, res, next) {
  // console.log(err);
  console.error(err);
  console.error(new Error('404').stack);
  console.log('next: ', next);
  next();
});

app.get('/api/*', handlers.getApi);
app.post('/create', handlers.postSkeleton);
app.post('/upvote', handlers.checkTokenHandler, handlers.upvote);
app.post('/addEntry', handlers.checkTokenHandler, handlers.addEntry);
app.post('/editEntry', handlers.checkTokenHandler, handlers.editEntry);

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
