"use strict";

//libs

"use strict";

//libs
const uuidv4  = require('uuid/v4');
const express = require('express');
const router  = new express.Router();
const knex    = require('../db/knex');
let bcrypt = require("bcryptjs");
let jwt = require("jsonwebtoken");
let fs = require('fs');

// PRIVATE and PUBLIC key
var privateKey  = fs.readFileSync('./server/authentication/private.key', 'utf8');
var publicKey  = fs.readFileSync('./server/authentication/public.key', 'utf8');


function comparePassword(userPassword, databasePassword, cb) {
  return bcrypt.compare(userPassword, databasePassword, cb);
}

function hashPassword(password) {
    return bcrypt.hashSync(password, 10);
}


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
		"expiresIn": "2h",
		"issuer": "ETF Lab"
	};
	var payload = jwt.verify(cookieList.token,publicKey,options);
	return payload;
}

function createUser(req){
	return {
		'user_id': uuidv4(),
		'username': req.body.username,
		'password_hash': hashPassword(req.body.password),
		'user_role': req.body.access
	};
}

			
/*
-----------------------------POST-------------------------------------
*/	
router.post('/user', (req, res) => {

	console.log('creating a new user: ' + req.body.username)

	
	if (checkCookie(req).user_role != "administrator") {
		res.send({"error": "access denied"});
		return 0;
	}
	
	
	const new_user = createUser(req);

	knex('users')
	.where('username', new_user.username)
	.then((result => {
		if (result != null) {
			knex('users')
			.insert(new_user)
			.returning(['*'])
			.then(users => {
				let reply = {
					"insertedCount": users.length,
					"collection": 'users',
					"username": users[0].username,
					"access": users[0].user_role,
				};
				res.send(reply);
			})
			.catch(err=>{
				res.status(500).json({message: err.message, stack:err.stack});
			})
		}
		else {
			res.status(403).json({  message: "User already exists."  });
		}
	}))
});
			
router.post('/login', (req, res) => {
	
	let username = req.body.username;
	let password = req.body.password;
					
	let options = {
		"algorithm": "RS256",
		"expiresIn": "2h",
		"issuer": "ETF Lab"
	};
	
	knex('users')
	.where('username', username)
	.first()
	.then((result)=>{
		console.log(result)
		if (result == null) {
			console.log('user not found'); // we know this, but we should act dumb to the front end 
			return res.status(403).json({message: "Incorrect Username/Password"})
		}

		comparePassword(password, result.password_hash, (err, isMatch) => {
			if (err) {
				throw new Error('Error while comparing passwords ??')
			}

			if(isMatch){
				let payload = {
					"username": result.username,
					"user_role": result.user_role
				};	
				var token = jwt.sign(payload,privateKey,options);
				res.cookie("token", token);
				return res.status(200).send({ token: token });
			}
			else{
				res.status(403).json({message: "Incorrect Username/Password"})
			}
		});
	});
	
});
			
/*
-----------------------------PUT-------------------------------------
*/

router.put('/user', (req, res) => {
	
	if (checkCookie(req).user_role != "administrator") {
		res.send({"error": "access denied"});
		return 0;
	}
	
	var newValue = createUser(req);
	var myQuery = {"username": req.body.username};

	knex('users')
	.where(myQuery)
	.update(newValue)
	.returning(['*'])
	.then(result=>{
		if(result.length == 0){
			res.status(403).json({message: 'User not found'});
			return
		}
		else{
			res.send(result);
		}
	})
	.catch(err=>{
		throw err;
	})
});

/*
-----------------------------GET-------------------------------------
*/
		

router.get('/user', function(req,res){
	console.log("User list requested for projectID ", req.body.projectID);
	knex('users_projects')
	.where('users_projects.project_id')
	.join('users', 'users.user_id', '=', 'users_projects.user_id')
	.select('users.*')
	.then(users => {
		let reply = [];
		for(let i=0; i<users.length; i++){
			reply.push({
				username: users[i].username,
				access: users[i].user_role
			});
		}
		res.send(reply);
		console.log("User list sent");
	})
	.catch(err=>{
		res.status(500).json({message: "Error Occured while getting users list"})
	})
})

router.get('/checkCookie', (req, res) => {
		console.log('checking for cookie');
		console.log(parseCookies(req));
		var payload = checkCookie(req);
		console.log(payload);
		res.send(payload);
});
		
		
/*
-----------------------------DELETE-------------------------------------
*/		

/*
NOT USED
router.delete('/user', function(req,res){
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
*/

module.exports = router;