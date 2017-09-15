var express = require('express');
var router = express.Router();
var multer = require('multer'); 
var fs = require('fs');

var storage = multer.diskStorage({
  destination: function(req, file, cb) {
    // encode email in hex to remove special chars
    var path = './uploads/' + Buffer(req.user._json.email).toString('hex');
    if (!fs.existsSync(path)){
      fs.mkdirSync(path);
    }
    cb(null, path);
  }, 
  filename: function(req, file, cb) {
    // Prevent clashes between files who share a name
    var newName = file.originalname + '.' + uid(16);
    cb(null, newName); 
  }
}); 

var upload = multer({
  storage: storage
});

/* GET upload portal page. */
router.get('/', ensureAuthenticated, function(req, res, next) {
  res.render('index', {
    view: 'index', name: req.user._json.given_name + " " + req.user._json.family_name
  }); 
});

router.post('/upload', ensureAuthenticated, upload.single('file'), function(req, res, next) {
  console.log(req.file);
  res.status(204).end(); 
});

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()){
    console.log ('---------------------------------------------------------------------------')
    console.log (req.user);
    next();
  } else {
    res.redirect('/octane/login/idp');
  }
}

// Used to generate a unique ID 
function uid (len) {
  var buf = '';
  var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (var i = 0; i < len; ++i) {
    buf += chars[getRandomInt(0, chars.length - 1)];
  }

  return buf;
};

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

module.exports = router;
