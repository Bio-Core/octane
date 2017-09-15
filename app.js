var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var expressValidator = require('express-validator');
var flash = require('connect-flash');
var session = require('express-session');
var timeout = require('connect-timeout');
var routes = require('./routes/index');
var login = require('./routes/login');
var logout = require('./routes/logout');
var multer = require('multer');
var fs = require('fs');
var Keycloak = require('keycloak-connect');
var jwt = require('jsonwebtoken');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

var memoryStore = new session.MemoryStore();


var storage = multer.diskStorage({
    destination: function(req, file, cb) {
          var user = jwt.decode(JSON.parse(req.session['keycloak-token']).access_token);
              var path = './uploads/' + Buffer(user.email).toString('hex');
                  if (!fs.existsSync(path)){
                          fs.mkdirSync(path);
                              }
                      var filePath = path + '/' + file.originalname+'.';
                          console.log (filePath);
                              if (fs.existsSync(filePath)){
                                      console.log ("File is here");
                                            cb(new Error ("fileExists"))
                                                  } else {
                                                          cb(null, path);  
                                                              }
                                  
                                },
    filename: function(req, file, cb) {
          var newName = file.originalname + '.';
              cb(null, newName);
                }
});

var upload = multer({
    storage: storage
});

var app = express();

app.disable('x-powered-by');

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(favicon(path.join(__dirname, 'public/images', 'octane-icon.png')));
app.use(logger('dev'));
app.use(timeout('300s'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use('/octane', express.static(path.join(__dirname, 'public')));
app.use('/octane', express.static(path.join(__dirname, 'bower_components')));

app.use(session({
      secret: 'temporarySuperSecretSecret',
      saveUninitialized: true,
          resave: false,
            cookie: {
                    maxAge: 1000 * 60 * 10
                          },
                store: memoryStore
}));

var keycloak = new Keycloak({ store: memoryStore });

app.use(keycloak.middleware({
    logout: '/octane/logout',
    admin: '/'
}));

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
                  return email.endsWith("@uhnresearch.ca");
                      }
                        }
}));

app.use(flash());

app.use(function (req, res, next) {
    res.locals.success_msg = req.flash('success_msg');
      res.locals.error_msg = req.flash('error_msg');
        res.locals.error = req.flash('error');
          res.locals.user = req.user || null;
            next();
});

routes.keycloak = keycloak;

app.get('/octane/main', keycloak.protect ("octanePriviledge"), function(req, res, next) {
    var user = jwt.decode(JSON.parse(req.session['keycloak-token']).access_token);
      console.log (JSON.parse(req.session['keycloak-token']).access_token);
        res.render('index', {
              view: 'index', name: user.given_name
                  });
});

app.get('/octane', 
            function(req, res, next){res.render('login')})


app.post('/octane/upload',
              keycloak.protect("octanePriviledge"), 
                        upload.single('file'), 
                                  function(req, res, next) {res.status(204).end()});

app.use(function(req, res, next) {
    var err = new Error('Not Found');
      err.status = 404;
        next(err);
});

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

app.use(function(err, req, res, next) {
    res.status(err.status || 500);
      res.render('error', {
            message: err.message,
            error: err,
                env: 'production'
                    });
});

module.exports = app;
