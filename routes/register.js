var express = require('express');
var router = express.Router();
var fs = require('fs-extra'); 

var User = require('../models/user');

/* GET registration page. */
router.get('/', function(req, res, next) {
  res.render('register');
});

router.post('/', function(req, res, next) {
  var first = req.body.first;
  var last = req.body.last;
  var email = req.body.email;
  var password = req.body.password;
  var password2 = req.body.password2;

  // Different methods can be applied to each field, check the 
  // express-validator documentation for what they are. 
  req.checkBody('first', 'First name is required').notEmpty(); 
  req.checkBody('last', 'Last name is required').notEmpty(); 
  req.checkBody('email', 'Email is not valid').isEmail().isUHNEmail(); //Double errors, check 
  req.checkBody('password', 'Password is required').notEmpty();
  req.checkBody('password2', 'Passwords do not match').equals(req.body.password);

  var errors = req.validationErrors(); 

  if (errors) {
    res.render('register', {
      errors: errors
    }); 
  } else {
    var newUser = new User({
      first: first, 
      last: last, 
      email: email, 
      password: password
    });

    User.createUser(newUser, function(err, user) {
      if (err) throw err; 
      //console.log(user); 
    }); 

    // Create folder for user. Files will not be uploaded if this
    // folder is missing (used as storage in index.js router). 
    var filePath = './uploads/' + email;  
    fs.mkdirs(filePath, function (err) {
      if (err) throw err; 
      //console.log("Success w/ folder!!"); 
    }); 

    req.flash('success_msg', 'You\'re registered! Go ahead and log in.'); 
    res.redirect('/login'); 
  }
});

module.exports = router;
