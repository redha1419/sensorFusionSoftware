"use strict";

//libs
const uuidv4 = require('uuid/v4');

module.exports = (app, MongoClient, mongoDBurl, mongodb) => {
    const projectHelper = require('../libs/helperFunctions.js.js')(mongodb);
	const authenticaton = require('../libs/users.js.js')(mongodb);
	
	function createSensorInstance(req, ID){
		var sensor = {
			'sensorID': uuidv4(),
			'sensorType': req.body.sensorReference,
			'sensorName': req.body.sensorName,
			'users': [authenticaton.getUser(req)],
			'sensorFrames': []
		};
		if (ID != undefined) {
			sensor.sensorID = ID;
		}
		if ( (req.body.users != undefined) && (projectHelper.itemInArray(sensor.users[0], req.body.users) == -1) ){
			sensor.users = sensor.users.concat(req.body.users);
		} else if (req.body.users != undefined){
			sensor.users = req.body.users;
		}
		if ( (req.body.sensorName != undefined) && (typeof req.body.sensorName === 'string') ){
			sensor.sensorName = req.body.sensorName;
		}
		return sensor;
	}
	
	return {
		"configureRoutes": () => {

		
/*
---------------------------POST------------------------------------------------
*/		
			app.post('/sensor', function(req, res){
				var coll = "projects";
				var reply;
				var project;
			    console.log("adding sensor to"+req.body.projectID);
				mongodb.collection(coll).findOne({'projectID': req.body.projectID }, function( err, result) {
					if (err) throw err;
					project = result;
					var myquery = {'projectID' : project.projectID};
					var sensor = createSensorInstance(req);
					var newvalues = {$push: {'sensors': sensor}};
					mongodb.collection(coll).updateOne(myquery, newvalues, function(err, result) {
					if (err) throw err;
					console.log("Sensor Saved\tID: " + sensor.sensorID + "\t\tName: " + sensor.sensorName );
					reply = {
					   "insertedCount": result.nModified,
					   "collection": coll,
					   "projectName": project.projectName,
					   "projectID": project.projectID,
					   "sensorName": sensor.sensorName,
					   "sensorID": sensor.sensorID
                        };
                    projectHelper.updateProjectDate(req.body.projectID);
					res.send(reply);
					})
				});
			})
			app.post('/addSensor', function(req, res){
				var coll = "projects";
				var reply;
				var project;
				console.log("adding sensor to"+req.body.projectID);
				mongodb.collection(coll).findOne({'projectID': req.body.projectID }, function( err, result) {
					if (err) throw err;
					project = result;
					var myquery = {'projectID' : project.projectID};
					var sensor = createSensorInstance(req);
					var newvalues = {$push: {'sensors': sensor}};
					mongodb.collection(coll).updateOne(myquery, newvalues, function(err, result) {
					if (err) throw err;
					console.log("Sensor Saved\tID: " + sensor.sensorID + "\t\tName: " + sensor.sensorName );
					reply = {
					   "insertedCount": result.nModified,
					   "collection": coll,
					   "projectName": project.projectName,
					   "projectID": project.projectID,
					   "sensorName": sensor.sensorName,
					   "sensorID": sensor.sensorID
                        };
                    projectHelper.updateProjectDate(req.body.projectID);
					res.send(reply);
					})
				});
			})

/*
------------------------------------GET------------------------------------------
*/			
			app.get('/listSensors?', function(req,res){
				var coll = "projects";
				var projectID = req.query.projectID ? req.query.projectID : 'No Project ID';
				console.log("Sensor details requested in project " + projectID);
				console.log(projectID);
				mongodb.collection(coll).findOne({'projectID': projectID}, function(err, result){
					if (err) throw err;
					var reply = [{}];
					for (var i = 0; i < result.sensors.length; i++) {
						reply[i] = {
							'sensorName': result.sensors[i].sensorName,
							'sensorID': result.sensors[i].sensorID,
							'sensorType': result.sensors[i].sensorReference
						}
					}
					console.log("--------------");
					console.log(authenticaton.getUser(req));
					console.log(result);
					console.log(projectHelper.itemInArray(
								authenticaton.getUser(req), 
								result.users));
													console.log("--------------");

					if (projectHelper.itemInArray(
								authenticaton.getUser(req), 
								result.users) >= 0){
						console.log(reply);
						res.send(reply);
					}else{
						res.send({'error' : "unauthorized"});
					}
					
					console.log("Project details sent");
				})
			})
			app.get('/numberOfSensors?', function(req,res){
				var coll = "projects";
				var projectID = req.query.projectID ? req.query.projectID : 'No Project ID';
				console.log("Sensor details requested in project " + projectID);
				console.log(projectID);
				mongodb.collection(coll).findOne({'projectID': projectID}, function(err, result){
					if (err) throw err;
					var reply = [{}];
					for (var i = 0; i < result.sensors.length; i++) {
						reply[i] = {
							'sensorName': result.sensors[i].sensorName,
							'sensorID': result.sensors[i].sensorID,
							'sensorType': result.sensors[i].sensorReference
						}
					}
					console.log("--------------");
					console.log(authenticaton.getUser(req));
					console.log(result);
					console.log(projectHelper.itemInArray(
								authenticaton.getUser(req), 
								result.users));
													console.log("--------------");

					if (projectHelper.itemInArray(
								authenticaton.getUser(req), 
								result.users) >= 0){
						console.log(reply.length);
						res.send(reply.length);
					}else{
						res.send({'error' : "unauthorized"});
					}
					
					console.log("Project details sent");
				})
			})
			
			app.get('/sensor?', function(req,res){
				var coll = "projects";
				var projectID = req.query.projectID ? req.query.projectID : 'No Project ID';
				var sensorID = req.query.sensorID ? req.query.sensorID : 'No Sensor ID';
				console.log("Sensor details requested");
				console.log(projectID);
				if (authenticaton.getPermission(req).read == 'true'){
					mongodb.collection(coll).findOne({'projectID': projectID}, function(err, result){
						if (err) throw err;
						var response = 0;
						var sensorIndex = result.sensors.findIndex(
							function(sense) {
								return sense.sensorID === sensorID
							}
						)
						response = result.sensors[sensorIndex]
						
						if (projectHelper.itemInArray(
										authenticaton.getUser(req), 
										result.sensors[sensorIndex].users) >= 0){
							
							console.log(response);
							res.send(response);
						}else{
							res.send({'error' : "unauthorized"});
						}
						
						
						console.log("Project details sent");
					})
				}else {
					res.send({'error' : "unauthorized"});
				}
			})
/*
-------------------------------PUT--------------------------------
*/			

			app.put('/sensor',function(req,res){
				var coll = "projects";
				console.log('Updating Sensor: ' + req.body.sensorID);
				mongodb.collection(coll).findOne({'projectID': req.body.projectID}, function(err, result){
					var sensorIndex = result.sensors.findIndex(
						function(sense) {
							return sense.sensorID === req.body.sensorID
						}
					)
					console.log(result);
					console.log(result.sensors);
					console.log(sensorIndex);
					console.log(result.sensors[sensorIndex]);
					console.log();
					
					for (var i = 0; i < result.sensors[sensorIndex].users.length; i++){
							if (result.sensors[sensorIndex].users[i] == authenticaton.getUser(req)){
								if (authenticaton.getPermission(req).write == 'true') {
									
								
									var myObj = {};
									myObj["sensors."+sensorIndex] = createSensorInstance(req, req.body.sensorID);
									var myQuery = {
										"projectID": req.body.projectID
									}
									var newValues = {$set: myObj}
					
									if (projectHelper.itemInArray(
										authenticaton.getUser(req), 
										result.sensors[sensorIndex].users) >= 0){
										mongodb.collection(coll).update(myQuery,newValues, function(err, result) {
											if (err) throw err;
											console.log(result);
											projectHelper.updateProjectDate(req.body.projectID);
											res.send(result);
										})	
											
											
									} else {
										res.send({'error' : "unauthorized"});
									}
									
									
									return;
								}
							}
						}
						console.log("access denied");
						res.send({'error':'access denied'});
					
					
					
					
				})
			})
/*
-------------------------------DELETE--------------------------------
*/

			app.delete('/sensor',function(req, res){
				var coll = "projects";
				var projectID = req.query.projectID ? req.query.projectID : 'No Project ID';
				var sensorID = req.query.sensorID ? req.query.sensorID : 'No Sensor ID';
				console.log("Delete Sensor requested");
				console.log(projectID);
				mongodb.collection(coll).findOne({'projectID': projectID}, function(err, result){
					if (err) throw err;
					var sensors = result.sensors;
					var removeSensorIndex = result.sensors.findIndex(
						function(sense) {
							return sense.sensorID === sensorID
						}
					);
					sensors.splice(removeSensorIndex,1);
					console.log(sensors);
					console.log('----------');
					var myobj = {};
					myobj["sensors"] = sensors;
					console.log(myobj);
					var newValues = {$set: myobj};
					var myQuery = {"projectID" : projectID};
					mongodb.collection(coll).updateOne(myQuery, newValues, function(err, result){
                        if (err) throw err;
                        projectHelper.updateProjectDate(req.body.projectID);
						console.log("Sensor deleted");
					})
				})
			})


		
		}
	}
}