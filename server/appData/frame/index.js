"use strict";

//libs
const uuidv4 = require('uuid/v4');

module.exports = (app, MongoClient, mongoDBurl, mongodb) => {
    const projectHelper = require('../libs/helperFunctions.js')(mongodb);
    return {
		"configureRoutes": () => {

/*
-------------------------------POST----------------------------
*/		
		
			app.post('/addFrame', function(req, res){
				if (projectHelper.checkUser(req.body.username, req.body.password) == false) {
					console.log('invalid credentials: ' + req.body.username);
					res.send({'error': 'invalid credentials: ' + req.body.username});
					return;
				}
				var coll = "projects";
				var reply;
				var project;
				var sensorFrame;
				console.log("adding frame to"+req.body.projectID+">>"+req.body.sensorID);
				console.log(req.body);
		//		MongoClient.connect(mongoDBurl, function(err, db) {
		//			var dbo = db.db("mydb");
		//			if (err) throw err;
		//			dbo.collection(coll).findOne({'projectID': req.body.projectID }, function( err, result) {
					mongodb.collection(coll).findOne({'projectID': req.body.projectID }, function( err, result) {
						if (err) throw err;
						project = result;
						var myquery = {'projectID' : project.projectID};
						sensorFrame = {
							'frameID': uuidv4(),
                            'frameName': req.body.frameName,
                            'description': req.body.description,
							'users': req.body.users,
							'translation': {
								"x": "",
								"y": "",
								"z": "",
								"alpha": "",
								"beta": "",
								"gama": "",
								"time": ""
							},
							'boundingBox': []
						};
						var mySensor = project.sensors.findIndex(
							function(sense){
								return sense.sensorID === req.body.sensorID
							});
						var myObj = {};
						myObj["sensors."+mySensor+".sensorFrames"] = sensorFrame;
						var newvalues = {$push: myObj};
		//				dbo.collection(coll).updateOne(myquery, newvalues, function(err, result) {
						mongodb.collection(coll).updateOne(myquery, newvalues, function(err, result) {
							if (err) throw err;
							console.log("Frame Saved");
							var dotNotationName = "sensors." + mySensor + ".sensorName";
							reply = {
							   "insertedCount": result.nModified,
							   "collection": coll,
							   "projectName": project.projectName,
							   "projectID": project.projectID,
							   "sensorName": dotNotationName,
							   "sensorID": req.body.sensorID,
                                "frameName": sensorFrame.frameName,
                                "description": req.body.description,
							   "frameID": sensorFrame.frameID 
                            };
                            projectHelper.updateProjectDate(req.body.projectID);
						//	console.log(reply);
							res.send(reply);
		//					db.close
						})
					});
		//		})
			})		

			app.post('/frame', function(req, res){
				if (projectHelper.checkUser(req.body.username, req.body.password) == false) {
					console.log('invalid credentials: ' + req.body.username);
					res.send({'error': 'invalid credentials: ' + req.body.username});
					return;
				}
				var coll = "projects";
				var reply;
				var project;
				var sensorFrame;
				console.log("adding frame to"+req.body.projectID+">>"+req.body.sensorID);
				console.log(req.body);
		//		MongoClient.connect(mongoDBurl, function(err, db) {
		//			var dbo = db.db("mydb");
		//			if (err) throw err;
		//			dbo.collection(coll).findOne({'projectID': req.body.projectID }, function( err, result) {
					mongodb.collection(coll).findOne({'projectID': req.body.projectID }, function( err, result) {
						if (err) throw err;
						project = result;
						var myquery = {'projectID' : project.projectID};
						sensorFrame = {
							'frameID': uuidv4(),
                            'frameName': req.body.frameName,
                            'description': req.body.description,
							'users': req.body.users,
							'translation': {
								"x": "",
								"y": "",
								"z": "",
								"alpha": "",
								"beta": "",
								"gama": "",
								"time": ""
							},
							'boundingBoxes': []
						};
						var mySensor = project.sensors.findIndex(
							function(sense){
								return sense.sensorID === req.body.sensorID
							});
						var myObj = {};
						myObj["sensors."+mySensor+".sensorFrames"] = sensorFrame;
						var newvalues = {$push: myObj};
		//				dbo.collection(coll).updateOne(myquery, newvalues, function(err, result) {
						mongodb.collection(coll).updateOne(myquery, newvalues, function(err, result) {
						if (err) throw err;
						console.log("Frame Saved");
						var dotNotationName = "sensors." + mySensor + ".sensorName";
						reply = {
						   "insertedCount": result.nModified,
						   "collection": coll,
						   "projectName": project.projectName,
						   "projectID": project.projectID,
						   "sensorName": dotNotationName,
						   "sensorID": req.body.sensorID,
                            "frameName": sensorFrame.frameName,
                            "description": req.body.description,
						   "frameID": sensorFrame.frameID 
						};
                        projectHelper.updateProjectDate(req.body.projectID);
					//	console.log(reply);
						res.send(reply);
		//				db.close
						})
					});
		//		})
			})

/*
-------------------------------GET--------------------------
*/

			app.get('/listFrames?',function(req,res){
				var coll = "projects";
				var projectID = req.query.projectID ? req.query.projectID : 'No Project ID';
				var sensorID = req.query.sensorID ? req.query.sensorID : 'No Sensor ID';
				console.log("Sensor details requested");
				console.log(projectID);
		//		MongoClient.connect(mongoDBurl, function(err,db){
		//			if (err) throw err;
		//			var dbo = db.db("mydb");
		//			dbo.collection(coll).findOne({'projectID': projectID}, function(err, result){
					mongodb.collection(coll).findOne({'projectID': projectID}, function(err, result){
						if (err) throw err;
						var response = [];
						var sensorIndex = result.sensors.findIndex(
							function(sense) {
								return sense.sensorID === sensorID
							}
						)
						console.log(sensorIndex);
						for (var i = 0; i < result.sensors[sensorIndex].sensorFrames.length; i++) {
							response[i] = {
								'frameName': result.sensors[sensorIndex].sensorFrames[i].frameName,
								'users': result.sensors[sensorIndex].sensorFrames[i].users,
								'frameID': result.sensors[sensorIndex].sensorFrames[i].frameID
								
							}
						}
						
						console.log(response);
						res.send(response);
						console.log("Frame details sent");
		//				db.close		
					})
		//		})
			})
			
			
			app.get('/frame?',function(req,res){
				if (projectHelper.checkUser(req.query.username, req.query.password) == false) {
					console.log('invalid credentials: ' + req.body.username);
					res.send({'error': 'invalid credentials: ' + req.body.username});
					return;
				}
				var coll = "projects";
				var projectID = req.query.projectID ? req.query.projectID : 'No Project ID';
				var sensorID = req.query.sensorID ? req.query.sensorID : 'No Sensor ID';
				var frameID = req.query.frameID ? req.query.frameID : 'No frame ID';
				console.log("Sensor details requested");
				console.log(projectID);
		//		MongoClient.connect(mongoDBurl, function(err,db){
		//			if (err) throw err;
		//			var dbo = db.db("mydb");
		//			dbo.collection(coll).findOne({'projectID': projectID}, function(err, result){
					mongodb.collection(coll).findOne({'projectID': projectID}, function(err, result){
						if (err) throw err;
						var response = 0;
						var sensorIndex = result.sensors.findIndex(
							function(sense) {
								return sense.sensorID === sensorID
							}
						)
						var frameIndex = result.sensors[sensorIndex].sensorFrames.findIndex(
							function(sensFrame) {
								return sensFrame.frameID === frameID
							}
						)
						response = result.sensors[sensorIndex].sensorFrames[frameIndex]
						for (var i = 0; i < response.users.length; i++){
							if (response.users[i] == req.query.username){
								console.log(response);
								res.send(response);
								console.log("Project details sent");
								return;
							}
						}
						console.log("you don't have access");
						res.send({'error':"you don't have access"});
		//				db.close		
					})
		//		})
			})


/*
---------------------------------------PUT----------------------------------
*/			
			
			app.put('/frame',function(req,res){
				if (projectHelper.checkUser(req.body.username, req.body.password) == false) {
					console.log('invalid credentials: ' + req.body.username);
					res.send({'error': 'invalid credentials: ' + req.body.username});
					return 0;
				}
				var coll = "projects";
				console.log('Updating frame: ' + req.body.frameID);
		//		MongoClient.connect(mongoDBurl, function(err,db){
		//			if (err) throw err;
		//			var dbo = db.db("mydb");
		//			dbo.collection(coll).findOne({'projectID': req.body.projectID}, function(err, result){
					mongodb.collection(coll).findOne({'projectID': req.body.projectID}, function(err, result){
						var sensorIndex = result.sensors.findIndex(
							function(sense) {
								return sense.sensorID === req.body.sensorID
							}
						)
						console.log(result.sensors[sensorIndex]);
						var frameIndex = result.sensors[sensorIndex].sensorFrames.findIndex(
							function(sensFrame) {
								return sensFrame.frameID === req.body.frameID
							}
						)
						for (var i = 0; i < result.sensors[sensorIndex].sensorFrames[frameIndex].users.length; i++){
							if (result.sensors[sensorIndex].sensorFrames[frameIndex].users[i] == req.body.username){
								
								var myObj = {};
								myObj["sensors."+sensorIndex+".sensorFrames."+frameIndex] = {
									'frameID': req.body.frameID,
									'frameName': req.body.frameName,
									'description': req.body.description,
									'users' : req.body.users,
									'translation': {
										"x":     req.body.translation.x,
										"y":     req.body.translation.y,
										"z":     req.body.translation.z,
										"alpha": req.body.translation.alpha,
										"beta":  req.body.translation.beta,
										"gama":  req.body.translation.gama,
										"time":  req.body.translation.time
									}
								}
								var myQuery = {
									"projectID": req.body.projectID
								}
								var newValues = {$set: myObj}
								mongodb.collection(coll).update(myQuery,newValues, function(err, result) {
									if (err) throw err;
									console.log(result);
									projectHelper.updateProjectDate(req.body.projectID);
									res.send(result);
				// 					db.close();
								})		
								
								
								return;
							}
						}
						console.log("access denied");
						res.send({'error':'access denied'});
						
					})
				
		//		})
			})
		}
	}
}