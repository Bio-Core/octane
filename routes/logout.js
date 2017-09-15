var express = require('express');
var router = express.Router();
var passport = require('passport'); 
var LocalStrategy = require('passport-local').Strategy;

var endSession = 'https://oa.pmgenomics.ca/auth/realms/uhn/protocol/openid-connect/logout';

router.get('/', function(req, res){
  // if logged out in another tab
  if (req.user == undefined) {
    res.redirect('/octane');
    return;
  }
  var id_token = access_tokens[req.user._json.email];
  // logout of passport
  console.log (req.user); 
  console.log ("I logout");
  req.logout();
  console.log (req.user);
  // req.flash('success_msg', 'Successfully logged out'); 
  // logout of gluu (so passport doesn't automatically reauthenticate)  
  //console.log(req._passport);
  res.redirect(endSession + "?"+"redirect_uri="+"https://www.pmgenomics.ca/octane/login/idp");
});

module.exports = router;
