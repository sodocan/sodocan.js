var express = require('express');
var path = require('path');
var favicon = require('serve-favicon'); // currently not used
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

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
app.use(express.static(path.join(__dirname, 'StaticPages'))); // will this be used?

app.use('/users', usersRouter); // might change later to not use router

app.get('/api/*', handlers.getApi);
app.post('/create', handlers.postSkeleton);
app.post('/upvote', handlers.upvote);
app.post('/addEntry', handlers.addEntry);
//NOTE: figure out best practices for above route

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
