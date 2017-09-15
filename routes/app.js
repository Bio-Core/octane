var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
//var validator = require('validator');
var expressValidator = require('express-validator');
var flash = require('connect-flash');
var session = require('express-session');
var timeout = require('connect-timeout');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

var routes = require('./routes/index');
var login = require('./routes/login'); 
var logout = require('./routes/logout'); 

var app = express();

// Remove X-Powered-By header
app.disable('x-powered-by'); 

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// Icon made by Freepik (http://www.flaticon.com/authors/freepik')
app.use(favicon(path.join(__dirname, 'public/images', 'octane-icon.png')));
app.use(logger('dev'));
app.use(timeout('300s'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use('/octane', express.static(path.join(__dirname, 'public')));
app.use('/octane', express.static(path.join(__dirname, 'bower_components')));

// Express Session
app.use(session({
    secret: 'temporarySuperSecretSecret',
    saveUninitialized: true,
    resave: true, 
    cookie: {
      maxAge: 1000 * 60 * 10 
    }
}));

// Passport init
app.use(passport.initialize());
app.use(passport.session());

// Express Validator
app.use(expressValidator({
  errorFormatter: function(param, msg, value) {
      var namespace = param.split('.')
      , root    = namespace.shift()
      , formParam = root;

    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param : formParam,
      msg   : msg,
      value : value
    };
  }, 
  customValidators: {
    isUHNEmail: function(email){
      return email.endsWith("@uhnresearch.ca"); //Also send email? 
    }
  }
}));

// Connect Flash
app.use(flash());

// Global Vars
app.use(function (req, res, next) {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  res.locals.user = req.user || null;
  next();
});

// Routes
// The '/' route taken care of by PMGC
app.use('/octane', routes);
app.use('/octane/login', login); 
app.use('/octane/logout', logout); 

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.locals.pretty = true; 
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: err,
    env: 'production'
  });
});


module.exports = app;
