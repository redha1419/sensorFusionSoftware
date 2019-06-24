"use strict";

//libs
const uuidv4  = require('uuid/v4');
const express = require('express');
const router  = new express.Router();
const knex    = require('../../db/knex');
const moment  = require('moment');
const projectHelper = require('../libs/helperFunctions.js')(knex);
const authenticaton = require('../libs/users.js')(knex);
	
function createSensorInstance(req, ID){
	var sensor = {
		'sensor_id': uuidv4(),
		'sensor_type': req.body.sensorReference,
		'sensor_name': req.body.sensorName
	};

	if (ID != undefined) {
		sensor.sensor_id = ID;
	}

	if ( (req.body.users != undefined) && (projectHelper.itemInArray(sensor.users[0], req.body.users) == -1) ){
		sensor.users = sensor.users.concat(req.body.users);
	}
	else if (req.body.users != undefined){
		sensor.users = req.body.users;
	}

	return sensor;
}
	

		
/*
---------------------------POST------------------------------------------------
*/		
/*
NOT USED
router.post('/sensor', function(req, res){
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
*/


router.post('/addSensor', function(req, res){
	console.log("adding sensor to: "+req.body.projectID);
	knex('projects')
	.where('project_id', req.body.projectID)
	.first()
	.then(project=>{
		let sensor = createSensorInstance(req);
		console.log(sensor)
		sensor.project_id = project.project_id;
		knex('sensors')
		.insert(sensor)
		.returning(['*'])
		.then(sensors=>{
			console.log("Sensor Saved\tID: " + sensors[0].sensor_id + "\t\tName: " + sensors[0].sensor_name );
			let reply = {
				"insertedCount": sensors.length,
				"collection": 'sensors',
				"projectName": project.project_name,
				"projectID": project.project_id,
				"sensorName": sensor.sensor_name,
				"sensorID": sensor.sensor_id
			};
			projectHelper.updateProjectDate(req.body.projectID);
			res.send(reply);
		})
		.catch(err=>{
			res.status(500).json({message: 'Error', stack:err.stack});
		})
	})
	.catch(err=>{
		res.status(500).json({message: 'Error', stack:err.stack});
	})
})

/*
------------------------------------GET------------------------------------------
*/			
router.get('/listSensors?', function(req,res){
	const projectID = req.query.projectID ? req.query.projectID : 'No Project ID';
	console.log("Sensor details requested in project " + projectID);
	
	knex('sensors')
	.where('project_id', projectID)
	.then(sensors => {
		let reply = [];
		for (var i = 0; i < sensors.length; i++) {
			reply.push({
				'sensorName': sensors[i].sensor_name,
				'sensorID': sensors[i].sensor_id,
				'sensorType': sensors[i].sensor_type
			});
		}
		/*
		console.log("--------------");
		console.log(authenticaton.getUser(req));
		console.log(result);
		console.log(projectHelper.itemInArray(authenticaton.getUser(req), result.users));
		console.log("--------------");
		*/

		/*
		TODO: user authentication
		if (projectHelper.itemInArray(authenticaton.getUser(req), result.users) >= 0){
			console.log(reply);
			res.send(reply);
		}
		else
		{
			res.send({'error' : "unauthorized"});
		}
		*/
		res.send(reply)
	})
	.catch(err=>{
		res.status(500).json({message: err.message, stack:err.stack});
	})
})

/*
NOT USED
router.get('/numberOfSensors?', function(req,res){
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
*/

/*
NOT USED
router.get('/sensor?', function(req,res){
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
*/
/*
-------------------------------PUT--------------------------------
*/			

/*
NOT USED
router.put('/sensor',function(req,res){
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
*/

/*
-------------------------------DELETE--------------------------------
*/

/*
NOT USED
router.delete('/sensor',function(req, res){
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
*/

module.exports = router;