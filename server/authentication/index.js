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
		'username': req.body.username.toLowerCase(),
		'password_hash': hashPassword(req.body.password),
		'user_role': req.body.access
	};
}

			
/*
-----------------------------POST-------------------------------------
*/	
router.post('/user', (req, res) => {

	console.log('creating a new user: ' + req.body.username.toLowerCase())

	
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
	
	let username = req.body.username.toLowerCase();
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

router.post('/forgot_account', (req, res) => {
	let email = req.body.email;
	knex('users')
	.where('email', email)
	.first()
	.then(user=>{
		if(user){
			//send an email here with 
			let username = user.username;
			//we will create some crazy password for them
			let temp_password =  uuidv4();
			//we will store this crazy passsword in the db (hashed ofcourse, extra crazy)
			knex('users')
			.update('password_hash', hashPassword(temp_password))
			.update('temp_pass', true)
			.where('user_id', user.user_id)
			.then(()=>{
				//TODO: send email func!
				res.status(200).json({message: "Succesfully reset your password, please check your email for instructions"})
			})
			.catch(err=>{
				res.status(500).json({message: err.message, stack:err.stack});
			})
		}else{
			//we havent found the user, thus wrong email
			res.status(403).json({message:"User not found with email: " + email})
		}
	})
	.catch(err=>{
		res.status(500).json({message: err.message, stack:err.stack});
	})
});

router.post('/change_password', (req, res) => {
	let username = req.body.username.toLowerCase();
	let temp_password = req.body.temporaryPassword;
	let new_password = req.body.newPassword;

	knex('users')
	.where('username', username)
	.first()
	.then(user=>{
		if(user && user.temp_pass){
			//found user and we need to match its password to confirm and change!
			comparePassword(temp_password, user.password_hash, (err, isMatch) => {
				if(isMatch){
					knex('users')
					.where('username', username)
					.update('password_hash', new_password)
					.then(()=>{
						res.status(200).json({message:'User password has been successfully updated!'})
					})
					.catch(err=>{
						res.status(500).json({message: err.message, stack:err.stack});
					})
				}
				else{
					res.status(403).json({message:'Error: User temporary password incorrect!'})
				}
			});
		}
		else{
			res.status(403).json({message: 'User not found or user not allowed to change their password!'})
		}
	})
	.catch(err=>{
		res.status(500).json({message: err.message, stack:err.stack});
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
	var myQuery = {"username": req.body.username.toLowerCase()};

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
	console.log("User list requested for projectID ", req.query.projectID);
	knex('users_projects')
	.where('users_projects.project_id', req.query.projectID)
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

router.get('/verifyUser', function(req,res){
	knex('users')
	.where('username', req.query.user.toLowerCase())
	.first()
	.then(user => {
		if(user){
			res.status(200).json({message: "true"});
		}
		else{
			res.status(200).json({message: "false"});
		}
	})
	.catch(err=>{
		res.status(500).json({message: "Error Occured while getting users list"})
	})
})

router.get('/getAllUsers', function(req, res){
	knex('users')
	.select('users.*', 'users.user_role as access')
	.then(users => {
		res.send(users);
		console.log("User list sent");
	})
	.catch(err=>{
		res.status(500).json({message: "Error Occured while getting users list"})
	})
});

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