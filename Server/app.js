var express = require('express');
var path = require('path');
var favicon = require('serve-favicon'); // currently not used
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var GitHubStrategy = require('passport-github').Strategy;
var expressSession = require('express-session');
// var everyauth = require('everyauth');
var BearerStrategy = require('passport-http-bearer').Strategy;
var jwt = require('jwt-simple');

//var crowdsourceRouter = require('./Routes/crowdsource');
var usersRouter = require('./Routes/users');
//var createRouter = require('./Routes/create');
var handlers = require('./Utilities/requestHandlers');

var app = express();

// view engine setup
//app.set('views', path.join(__dirname, 'views'));
//app.set('view engine', 'jade');

app.use(favicon(path.join(__dirname, '../public/images', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
// app.use(express.methodOverride());
app.use(expressSession({
  secret: 'secret',
  resave: false,
  saveUninitialized: false
}));
//app.use(everyauth.middleware(app));

app.use(passport.initialize());
app.use(passport.session());
// app.use(express.static(path.join(__dirname, 'StaticPages'))); // will this be used?
app.use(express.static(path.join(__dirname, '../public')));

// stores github id/secret
var id, secret, callbackURL;

if (process.env.CLIENT_ID && process.env.CLIENT_SECRET && process.env.CALLBACK_URL) {
  id = process.env.CLIENT_ID;
  secret = process.env.CLIENT_SECRET;
  callbackURL = process.env.CALLBACK_URL;
} else {
  var authConfig = require('./authenticationConfig');
  id = authConfig.github.clientID;
  secret = authConfig.github.clientSecret;
  callbackURL = authConfig.github.callbackURL;
}

var User = require('./Databases/Models/users.js');
passport.use(new LocalStrategy(User.authenticate()));

//passport.serializeUser(User.serializeUser());
//passport.deserializeUser(User.deserializeUser());
passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

passport.use(new GitHubStrategy({
  clientID: id,
  clientSecret: secret,
  callbackURL: callbackURL
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

    User.findOne({
      username: profile.username + '.git'
    },
    function(err, user) {
      if (err) {
        console.error(err);
        return;
      }
      if (user) {
          console.log('user already found in database');
          done(null, user);
      } else {
        var user = new User({
          username: profile.username + '.git',
        });
        user.save(function(err) {
          if (err) {
            console.error(err);
          } else {
            console.log('saving user...');
            done(null, user);
          }
        });
      }
    });
}));

passport.use(new BearerStrategy(function(token, done) {
  try {
    var decoded = jwt.decode(token, process.env.tokenSecret || authConfig.tokenSecret);
    log('decoded',decoded);
    if (decoded.expiration < Date.now()) {
      return done(null, false);
    }
    User.findOne({username: decoded.username, session: decoded.session}, function(err, user) {
      if (err) {
        console.error(err);
        return done(err);
      }

      if (!user) {
        return done(null, false);
      } else {
        return done(null, user);
      }
    });
  }
  catch(err) {
    return done(null, false);
  }
}));

// app.use('/users', usersRouter); // might change later to not use router
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
app.post('/upvote', passport.authenticate('bearer', {session: false}), handlers.upvote);
app.post('/addEntry', passport.authenticate('bearer', {session: false}), handlers.addEntry);

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
