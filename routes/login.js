var express = require('express');
var router = express.Router();
var passport = require('passport');
var Strategy = require('passport-openidconnect').Strategy;
var fs = require('fs-extra');
var validator = require('validator');

/* GET login page. */
// The '/' is for /octane/login
router.get('/', function(req, res, next) {
    res.redirect('/octane/idp');
});

var baseURL= 'https://oa.pmgenomics.ca/auth/realms/UHN/protocol/openid-connect';
access_token = ''; // Sorry that this is global, no promises I'll fix it though ;)
access_tokens = {};

const client_id = fs.readFileSync('./client_id.txt').toString().trim();
const client_secret = fs.readFileSync('./client_secret.txt').toString().trim();

// Check callback for routing
passport.use(new Strategy({
	clientID: client_id,
	clientSecret: client_secret,
	authorizationURL: baseURL + '/auth',
	tokenURL: baseURL + '/token',
	callbackURL: 'https://pmgenomics.ca/octane/login/callback',
	userInfoURL: baseURL + '/userinfo',
	scope: 'email' // don't hardcode this
},
	// Take a look within the authenticate function of the passport-openidconnect
	// strategy in order to see the different overloads available
	function(iss, sub, profile, accessToken, refreshToken, params, cb) {
		// console.log("================");
		// console.log("PASSPORT CALLBACK");
		// console.log("ISS: " + iss);
		// console.log("SUB: " + sub);
		// console.log("Profile: " + profile);
		// Object.keys(profile).forEach(function(key) {
		//   console.log(key, profile[key]);
		// });
		// console.log("Access Token: " + accessToken);
		// console.log("Refresh Token: " + refreshToken);
		// console.log();
		// console.log("ID Token: " + params.id_token);
		// console.log();
		// //Object.keys(params).forEach(function(key) {
		// //  console.log(params, params[key]);
		// //});
		// console.log("CB: " + cb);
		// console.log("===============");

		access_token = params.id_token;
		access_tokens[profile._json.email] = access_token;

		return cb(null, profile);
	}));


passport.serializeUser(function(user, done) {
	done(null, user);
});

passport.deserializeUser(function(id, done) {
	done(null, id);
});

// /octane/login/idp
router.get('/idp',
	passport.authenticate('openidconnect', {failureRedirect: '/login', failureFlash: true}));

// /octane/login/callback
router.get('/callback',
	passport.authenticate('openidconnect', {failureRedirect: '/fail'}),
	function(req, res) {
		res.redirect('/octane');
	});

module.exports = router;
