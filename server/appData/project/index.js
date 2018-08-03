"use strict";

//libs
const uuidv4 = require('uuid/v4');

module.exports = (app, MongoClient, mongoDBurl) => {
	return {
		"configureRoutes": () => {

		
		
/*
-----------------------------POST-------------------------------------
*/
			//post a new project
			app.post('/project', function (req, res){
				console.log("creating new project:"+req.body.projectName);
				var coll = "projects";
				var reply;
				MongoClient.connect(mongoDBurl, function(err, db) {						//Establish mongo Connection
				  if (err) throw err;
				  var dbo = db.db("mydb");
				  var myobj = {
					"projectID": uuidv4(),
					"projectName": req.body.projectName,
					"Users": [],
					"sensors": [],
					"operations": [],
					"superframe": {}		  
				  };
				  dbo.createCollection(coll, function(err, res) {			//create projects Collection if non exists
					if (err) throw err;
					db.close();
				  });
				  dbo.collection(coll).insertOne(myobj, function(err, result) {	//Create Project Document
					if (err) throw err;
					console.log("Project Document Created");		
					reply = {
					   "insertedCount": result.insertedCount,
					   "collection": coll,
					   "projectName": result.ops[0].projectName,
					   "projectID": result.ops[0].projectID,
					   "_ID": result.ops[0]._id
					};
					res.send(reply);
					db.close();
				  });
				});
			})



			app.post('/addProject', function (req, res) {
				console.log("creating new project:"+req.body.projectName);
				var coll = "projects";
				var reply;
				MongoClient.connect(mongoDBurl, function(err, db) {						//Establish mongo Connection
				  if (err) throw err;
				  var dbo = db.db("mydb");
				  var myobj = {
					"projectID": uuidv4(),
					"projectName": req.body.projectName,
					"Users": [],
					"sensors": [],
					"operations": [],
					"superframe": {}		  
				  };
				  dbo.createCollection(coll, function(err, res) {			//create projects Collection if non exists
					if (err) throw err;
					db.close();
				  });
				  dbo.collection(coll).insertOne(myobj, function(err, result) {	//Create Project Document
					if (err) throw err;
					console.log("Project Document Created");		
					reply = {
					   "insertedCount": result.insertedCount,
					   "collection": coll,
					   "projectName": result.ops[0].projectName,
					   "projectID": result.ops[0].projectID,
					   "_ID": result.ops[0]._id
					};
					res.send(reply);
					db.close();
				  });
				});
			})
			
/*
-----------------------------PUT-------------------------------------
*/
			app.put('/project', function (req, res) {
				var coll = "projects";
				console.log('Updating Project: ' + req.body.projectID);
				MongoClient.connect(mongoDBurl, function(err,db){
					if (err) throw err;
					var dbo = db.db("mydb");
					var newValues = {$set: {
						"projectName": req.body.projectName
				} };
					var myQuery = {
						"projectID": req.body.projectID
					}
					dbo.collection(coll).update(myQuery,newValues, function(err, res) {
						if (err) throw err;
						console.log(res);
						db.close();
					})

				})
			})


/*
-----------------------------GET-------------------------------------
*/
			//get a project by ID
			app.get('/project?', function(req,res){
				var coll = "projects";
				var projectID = req.query.projectID ? req.query.projectID : 'No Project ID';
				console.log("Project details requested");
				console.log(projectID);
				MongoClient.connect(mongoDBurl, function(err,db){
					if (err) throw err;
					var dbo = db.db("mydb");
					dbo.collection(coll).findOne({'projectID': projectID}, function(err, result){
						if (err) throw err;
						console.log(result);
						res.send(result);
						console.log("Project details sent");
						db.close			
					})
				})
			})
		
		
			//get list of porjects and IDs
			app.get('/listProjects', function(req,res){
				var coll = "projects";
				var reply;
				var project;
				console.log("Project list requested");
				MongoClient.connect(mongoDBurl, function(err,db){
					if (err) throw err;
					var dbo = db.db("mydb");
					dbo.collection(coll).find({}).toArray(function(err, result){
						if (err) throw err;
						var reply = [{}];
						for (var i = 0; i < result.length; i++) {
							reply[i] = {
								'projectName': result[i].projectName,
								'projectID': result[i].projectID
							}
						}
						console.log(reply);
						res.send(reply);
						console.log("Project list sent");
						db.close			
					})
				
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
				MongoClient.connect(mongoDBurl, function(err,db){
					if (err) throw err;
					var dbo = db.db("mydb");
					dbo.collection(coll).deleteOne({'projectID': projectID}, function(err, result){
						if (err) throw err;
						console.log(result);
						res.send(result);
						console.log("Project deleted");
						db.close			
					})
				})				
			})	
		
		}
	}
}