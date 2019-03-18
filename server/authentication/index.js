"use strict";

//libs
const uuidv4 = require('uuid/v4');

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

function checkCookie(req){
	var cookieList = parseCookies(req);
	let options = {
		"algorithm": "RS256",
		"expiresIn": "10h",
		"issuer": "ETF Lab"
	};
	var payload = jwt.verify(cookieList.token,publicKey,options);
	return payload;
}

function createUser(req, ID){
	var sensorFrame = {
		'userID': uuidv4(),
		'username': req.body.username,
		'password': req.body.password,
		'access': req.body.access
	};
	if (ID != undefined) {
		sensorFrame.frameID = ID;
	}
	return sensorFrame;
}


module.exports = (app, mongodb) => {
	return {
		"configureRoutes": () => {
			
/*
-----------------------------POST-------------------------------------
*/	
			app.post('/user', (req, res) => {
				console.log("creating new project:"+req.body.projectName);
				if (checkCookie(req).access != "administrator") {
					res.send({"error": "access denied"});
					return 0;
				}
				
				var coll = "users";
				var reply;
				var myobj = createUser(req);
				mongodb.createCollection(coll, function(err, res) {			//create projects Collection if non exists
					if (err) throw err;
				});
				mongodb.collection(coll).findOne({'username': myobj.username}, function(err,result){
					if (result == null) {
						mongodb.collection(coll).insertOne(myobj, function(err, result) {	//Create Project Document
							if (err) throw err;
							console.log("User Created");		
							reply = {
								"insertedCount": result.insertedCount,
								"collection": coll,
								"username": result.ops[0].username,
								"access": result.ops[0].access,
							};
							res.send(reply);
						});
						
					}
					else {
						res.send({'error': 'user already exists'})
					}
				})
			});
			
			app.post('/login', (req, res) => {
				
                let username = req.body.username;
                let password = req.body.password;
								
				let options = {
                    "algorithm": "RS256",
                    "expiresIn": "10h",
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
			
/*
-----------------------------PUT-------------------------------------
*/
			app.put('/user', (req, res) => {
				console.log("creating new project:"+req.body.projectName);
				if (checkCookie(req).access != "administrator") {
					res.send({"error": "access denied"});
					return 0;
				}
				var coll = "users";
				var reply;
				var myobj = createUser(req);
				
				var newValues = {$set: createUser(req) };
				var myQuery = {"username": req.body.username};
				mongodb.collection(coll).update(myQuery,newValues, function(err, result) {
					if (err) throw err;
					console.log(result);
					res.send(result);
				})
			});

/*
-----------------------------GET-------------------------------------
*/
		
		app.get('/user', function(req,res){
				var coll = "users";
				var reply;
				console.log("User list requested");
				mongodb.collection(coll).find({}).toArray(function(err, result){
					if (err) throw err;
					var reply = [{}];
					for (var i = 0; i < result.length; i++) {
						reply[i] = {
							'username': result[i].username,
							'access': result[i].access
						}
					}
					console.log(reply);
					res.send(reply);
					console.log("User list sent");
			
				})
				
			})
		app.get('/checkCookie', (req, res) => {
				console.log('checking for cookie');
				console.log(parseCookies(req));
				
		/*		var cookieList = parseCookies(req);
                let options = {
                    "algorithm": "RS256",
                    "expiresIn": "10h",
                    "issuer": "ETF Lab"
                };
				var payload = jwt.verify(cookieList.token,publicKey,options);
		*/		var payload = checkCookie(req);
				console.log(payload);
				res.send(payload);
			});
		
		
/*
-----------------------------DELETE-------------------------------------
*/		
			app.delete('/user', function(req,res){
				if (checkCookie(req).access != "administrator") {
					res.send({"error": "access denied"});
					return 0;
				}				
				var coll = "users";
				var username = req.query.username ? req.query.username : 'No Project ID';
				console.log("Delete user requested");
				console.log(username);
				mongodb.collection(coll).deleteOne({'username': username}, function(err, result){
					if (err) throw err;
					console.log(result);
					res.send(result);
					console.log("User deleted");
				})
			})
		}
	};
}