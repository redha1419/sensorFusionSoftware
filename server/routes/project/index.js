"use strict";

//libs
const uuidv4  = require('uuid/v4');
const express = require('express');
const router  = new express.Router();
const knex    = require('../../db/knex');
const moment  = require('moment');
const projectHelper = require('../libs/helperFunctions.js')(knex);

let jwt = require("jsonwebtoken");
let fs = require('fs');

// PRIVATE and PUBLIC key
var publicKey  = fs.readFileSync('./server/authentication/public.key', 'utf8');

/*
module.exports = (app, MongoClient, mongoDBurl, mongodb) => {
	
	const authenticaton = require('../libs/users.js.js')(mongodb);
	
	function createProjectInstance(req, ID){
		
	}
	return {
		"configureRoutes": () => {
*/

		
		
/*
-----------------------------POST-------------------------------------
*/
//post a new project
router.post('/addProject', function (req, res) {
	console.log("creating new project: " + req.body.projectName);
	const date_stamp = moment().format();
	const project_to_add = {
		"project_id": uuidv4(),
		"name": req.body.projectName,
		"date_created": date_stamp,
		"date_modified": date_stamp,
		"description": req.body.description
	};

/* 
	if ( (req.body.users != undefined) && (projectHelper.itemInArray(myobj.users[0], req.body.users) == -1) ){
		myobj.users = myobj.users.concat(req.body.users);
	} 
	else if (req.body.users != undefined){
		myobj.users = req.body.users;
	}
*/

	knex('projects')
	.insert(project_to_add)
	.returning(['*'])
	.then((result)=>{
		req.body.users.forEach( async function(user){
			return new Promise(() => {
				knex('users_projects')
				.insert({
					user_id: knex('users').where('username',user).select('user_id'),
					project_id: result[0].project_id
				}).then(()=>{
					//we need this .then ? I think this needs to be here so the promise is satisfied ?
				})
				.catch(err=>{
					console.log(err)
				})
			})
		})
		let reply = {
			"insertedCount": result.length, //lets see if we can get this info
			"collection": "projects",
			"projectName": result[0].name,
			"projectID": result[0].project_id,
			"_ID": result[0].id,
			"dateCreated": result[0].date_created,
			"dateModified": result[0].date_modified
		};
		res.send(reply);
	})
});

router.post('/project_config', function (req, res){
	knex('users_projects')
	.where({
		user_id: knex('users').where('username', req.body.username).select('user_id').first(),
		project_id: req.body.projectID
	})
	.update({config_file: req.body.configFile})
	.then(()=>{
		res.status(200).json({message: "Succesfully updated users_projects with config file"})
	})
	.catch(err=>{
		console.log(err)
		res.status(500).json({message: "Not able to update users_projects with config file"})
	})
});


/*
-----------------------------PUT-------------------------------------
*/
router.put('/project', function (req, res) {
	console.log('Updating Project: ' + req.body.projectID);
	const newValues = { "name": req.body.projectName };
	const myQuery = {"project_id": req.body.projectID };

	knex('projects')
	.update(newValues)
	.where(myQuery)
	.returning(['*'])
	.then((result)=>{
		projectHelper.updateProjectDate(req.body.projectID);
		res.send(result);
	})
	.catch(err=>{
		res.status(500).json({message: err.message, stack:err.stack});
	})
});

/*
-----------------------------GET-------------------------------------
*/
//get a project by ID
//NOT USED
/*
router.get('/project?', function(req,res){
	var coll = "projects";
	var projectID = req.query.projectID ? req.query.projectID : 'No Project ID';
	console.log("Project details requested");
	console.log(projectID);
	if (authenticaton.getPermission(req).read == 'true'){
		mongodb.collection(coll).findOne({'projectID': projectID}, function(err, result){
			if (err) throw err;
			
			
			if (projectHelper.itemInArray(
							authenticaton.getUser(req), 
							result.users) >= 0){
				console.log(result);
				res.send(result);
			}else{
				res.send({'error' : "unauthorized"});
			}
			
			
			
			console.log("Project details sent");
		})
	}else {
		res.send({'error' : "unauthorized"});
	}	
		
})
*/

/* NOT USED
router.get('/projectUsers?', function(req,res){
	var coll = "projects";
	var projectID = req.query.projectID ? req.query.projectID : 'No Project ID';
	console.log("Project details requested");
	console.log(projectID);
	if (authenticaton.getPermission(req).read == 'true'){
		mongodb.collection(coll).findOne({'projectID': projectID}, function(err, result){
			if (err) throw err;
			
			
			if (projectHelper.itemInArray(
							authenticaton.getUser(req), 
							result.users) >= 0){
				result = projectHelper.getAllUsers(result);
				
				console.log("----");
				console.log(result);
				console.log("---");
				res.send(result);
			}else{
				res.send({'error' : "unauthorized"});
			}
			
			
			
			console.log("Project details sent");
		})
	}else {
		res.send({'error' : "unauthorized"});
	}
})
*/

/*
NOT USED
router.get('/date?', function(req,res){
	var date_stamp = new Date();
	projectHelper.getAllUsers();
	console.log(date_stamp.toString());
	res.send(date_stamp.toString());
})
*/
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
		
//get list of porjects and IDs
router.get('/listProjects', function(req,res){
	console.log("Project list requested");
	decoded = checkCookie(req);
	knex('users_projects')
	.where('users_projects.user_id', knex('users').where('username', decoded.username).select('user_id'))
	.join('projects', 'users_projects.project_id', '=', 'projects.project_id')
	.select('projects.*')
	.then(projects=>{
		let reply = [];
		for (var i = 0; i < projects.length; i++) {
			reply.push({
				'projectName': projects[i].name,
				'projectID': projects[i].project_id,
				'description': projects[i].description,
				'dateCreated': projects[i].date_created,
				'dateModified': projects[i].date_modified
			});
		}
		console.log(reply);
		res.send(reply);
		console.log("Project list sent");
	})
	.catch(err=>{
		res.status(500).json({message: err.message, stack:err.stack});
	})
});

router.get('/project_config', function (req, res){
	knex('users_projects')
	.where({
		user_id: knex('users').where('username', req.query.username).select('user_id').first(),
		project_id: req.query.projectID
	})
	.first()
	.then((user_project)=>{
		if(user_project){
			res.send({configFile: user_project.config_file});
		}else{
			throw new Error("project not found for user")
		}
	})
	.catch(err=>{
		console.log(err)
		res.status(500).json({message: "Not able to update users_projects with config file"});
	})
});

/*
NOT USED
router.get('/numberOfProjects', function(req,res){
	var coll = "projects";
	var reply;
	var project;
	console.log("Project list requested");
	mongodb.collection(coll).find({}).toArray(function(err, result){
		if (err) throw err;
		var reply = [{}];
		for (var i = 0; i < result.length; i++) {
			reply[i] = {
				'projectName': result[i].projectName,
				'projectID': result[i].projectID,
				'description': result[i].description,
				'dateCreated': result[i].dateCreated,
				'dateModified': result[i].dateModified
			}
		}
		console.log(reply.length);
		res.send(reply.length);
		console.log("Project list sent");

	})
	
})
*/
			
			
			
			

			
			
			
/*
-----------------------------DELETE-------------------------------------
*/


router.delete('/project?', function(req,res){
	var projectID = req.query.projectID ? req.query.projectID : 'No Project ID';
	console.log("Delete Project requested");
	console.log(projectID);
	knex('projects')
	.where('project_id', projectID)
	.delete()
	.then(()=>{
		console.log("Project deleted");
		res.status(200).json({status: 'ok', message: 'Succesfully deleted project!'})
	})
	.catch(err=>{
		res.status(500).json({message: 'Error', stack:err.stack});
	})
})	


module.exports = router;