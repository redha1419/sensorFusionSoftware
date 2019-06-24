"use strict";

let bcrypt = require("bcryptjs");
let jwt = require("jsonwebtoken");
let fs = require('fs');

// PRIVATE and PUBLIC key
var privateKey  = fs.readFileSync('./server/authentication/private.key', 'utf8');
var publicKey  = fs.readFileSync('./server/authentication/public.key', 'utf8');


function parseCookies (request) {
    var list = {},
        rc = request.headers.cookie;

    rc && rc.split(';').forEach(function( cookie ) {
        var parts = cookie.split('=');
        list[parts.shift().trim()] = decodeURI(parts.join('='));
    });

    return list;
}

// PRIVATE and PUBLIC key
var privateKey  = fs.readFileSync('./server/authentication/private.key', 'utf8');
var publicKey  = fs.readFileSync('./server/authentication/public.key', 'utf8');
let options = {
	"algorithm": "RS256",
	"expiresIn": "1h",
	"issuer": "ETF Lab"
};

module.exports = function(mongodb) {
	return{
		getUser: function(request) {
			var cookieList = parseCookies(request);
			var payload = jwt.verify(cookieList.token,publicKey,options);			
			return payload.username;
		},
		getPermission: function(request) {
			var cookieList = parseCookies(request);
			console.log(jwt.exp + " ?? " + Date.now());
			var payload;
			try {
				payload = jwt.verify(cookieList.token,publicKey,options);
			} catch (err) {
				payload = {"username": "none", "access": "none"};
			}
			console.log(payload);
			var result = {
				"read": 'false',
				"write": 'false',
				"delete": 'false',
			};
			if (payload.access == "administrator") {
				result = {
					"read": 'true',
					"write": 'true',
					"delete": 'true',
				};
			} else if (payload.access == "operator") {
				result = {
					"read": 'true',
					"write": 'true',
					"delete": 'true',
				};
			}
			return result;
		},
		unpackCookie: function(request) {
			var cookieList = parseCookies(request);
			var payload = jwt.verify(cookieList.token,publicKey,options);			
			return payload;
		},
		
		regenerateToken: function(request){
			var cookieList = parseCookies(request);
			var payload = jwt.verify(cookieList.token,publicKey,options);
			
			let payloadNew = {
				"username": payload.username,
				"access": payload.access
			};
				
			return jwt.sign(payloadNew,privateKey,options);
		},
		
		checkUserAccess: function(payload, structure){
			var response = 0;
			for (var i = 0; i < structure.users; i++) {
				if (structure.users[i] == payload.username) {
					response = payload.access;
				}
			}
			return response;
		}
		
		
		
	};
};

/*
exports.updateProjectDate = function() {
	console.log('funciton called');
	return 0;
}	
*/
