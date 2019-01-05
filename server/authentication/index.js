"use strict";

let bcrypt = require("bcryptjs");
let jwt = require("jsonwebtoken");
let fs = require('fs');

// PRIVATE and PUBLIC key
var privateKey  = fs.readFileSync('./server/authentication/private.key', 'utf8');
var publicKey  = fs.readFileSync('./server/authentication/public.key', 'utf8');


const userdb = "users";

function parseCookies (request) {
    var list = {},
        rc = request.headers.cookie;

    rc && rc.split(';').forEach(function( cookie ) {
        var parts = cookie.split('=');
        list[parts.shift().trim()] = decodeURI(parts.join('='));
    });

    return list;
}



module.exports = (app, mongodb) => {
	return {
		"configureRoutes": () => {
			app.post('/login', (req, res) => {
				
                let username = req.body.username;
                let password = req.body.password;
								
				let options = {
                    "algorithm": "RS256",
                    "expiresIn": "1h",
                    "issuer": "ETF Lab"
                };
				
				mongodb.collection(userdb).findOne({'username': username}, function(err, result) {
					if (result == null) {
						console.log('user no found');
						res.send({'no':'user'});
					}
					console.log("user found");
					console.log(result);
					if (password == result.password) {
						console.log("sending token");
						
						let payload = {
							"username": result.username,
							"access": result.access
						};
				
						var token = jwt.sign(payload,privateKey,options);
						console.log(token);
						res.cookie("token", token);
                        return res.status(200).send({ token: token });
						
						
					}
				});
				
			});
			
		app.get('/checkCookie', (req, res) => {
				console.log('checking for cookie');
				console.log(parseCookies(req));
				
				var cookieList = parseCookies(req);
                let options = {
                    "algorithm": "RS256",
                    "expiresIn": "1h",
                    "issuer": "ETF Lab"
                };
				var payload = jwt.verify(cookieList.token,publicKey,options);
				console.log(payload);
				res.send(payload);
			});
		}

	};
}