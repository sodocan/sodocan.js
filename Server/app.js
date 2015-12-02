var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var bodyParser = require('body-parser');
var passport = require('passport');

// Require modules for authentication
var LocalStrategy = require('passport-local').Strategy;
var GitHubStrategy = require('passport-github').Strategy;
var BearerStrategy = require('passport-http-bearer').Strategy;

var usersRouter = require('./Routes/users');
var handlers = require('./Utilities/requestHandlers');
var authHandlers = require('./Utilities/authHandlers');
var strategyUtil = require('./Utilities/strategyUtil');

var app = express();

app.use(logger('dev'));
app.use(favicon(path.join(__dirname, '../public/images', 'favicon.ico')));
app.use(bodyParser.json());

app.options('/*', handlers.sendOptionsHeader);

app.all('/*', handlers.setCorsHeader);

app.use(passport.initialize());
app.use(passport.session());
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

app.get('/api/*', handlers.getApi);
app.post('/create', authHandlers.checkTokenHandler, handlers.postSkeleton);
app.post('/upvote', authHandlers.checkTokenHandler, handlers.upvote);
app.post('/addEntry', authHandlers.checkTokenHandler, handlers.addEntry);
app.post('/editEntry', authHandlers.checkTokenHandler, handlers.editEntry);

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    console.error(new Error((err.status || 500) + '').stack);
    res.sendStatus(err.status || 500);
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.sendStatus(err.status || 500);
});

module.exports = app;
