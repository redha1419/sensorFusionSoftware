"use strict";

//libs
const uuidv4 = require('uuid/v4');
const express = require('express');
const router = new express.Router();
const knex =require('../../db/knex');

/*
module.exports = (app, MongoClient, mongoDBurl, mongodb) => {
	const projectHelper = require('../libs/helperFunctions.js.js')(mongodb);
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
	const date_stamp = new Date().toString();
	const project_to_add = {
		"project_id": uuidv4(),
		"name": req.body.projectName,
		"date_created": date_stamp.toString() ,
		"date_modified": date_stamp.toString(),
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
		console.log(result)
		reply = {
			"insertedCount": result.insertedCount, //lets see if we can get this info
			"collection": "projects",
			"projectName": result[0].project_name,
			"projectID": result[0].project_id,
			"_ID": result[0].id,
			"dateCreated": result.ops[0].date_created,
			"dateModified": result.ops[0].date_modified
		};
		res.send(reply);
	})
})


/*
-----------------------------PUT-------------------------------------
*/
router.put('/project', function (req, res) {
	console.log("PUT CALLED");
	var coll = "projects";
	console.log('Updating Project: ' + req.body.projectID);
	var newValues = {$set: {
		"projectName": req.body.projectName
	} };
	var myQuery = {
		"projectID": req.body.projectID
	}
	mongodb.collection(coll).update(myQuery,newValues, function(err, result) {
		if (err) throw err;
		console.log(result);
		res.send(result);
		projectHelper.updateProjectDate(req.body.projectID);
	})
})

/*
-----------------------------GET-------------------------------------
*/
//get a project by ID
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


app.get('/projectUsers?', function(req,res){
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


router.get('/date?', function(req,res){
	var date_stamp = new Date();
	projectHelper.getAllUsers();
	console.log(date_stamp.toString());
	res.send(date_stamp.toString());
})
		
		
//get list of porjects and IDs
router.get('/listProjects', function(req,res){
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
		console.log(reply);
		res.send(reply);
		console.log("Project list sent");

	})
	
})


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
			
			
			
			

			
			
			
/*
-----------------------------DELETE-------------------------------------
*/

			app.delete('/project?', function(req,res){
				var coll = "projects";
				var projectID = req.query.projectID ? req.query.projectID : 'No Project ID';
				console.log("Delete Project requested");
				console.log(projectID);
				mongodb.collection(coll).deleteOne({'projectID': projectID}, function(err, result){
					if (err) throw err;
					console.log(result);
					res.send(result);
					console.log("Project deleted");
				})
			})	
		
