"use strict";

//libs
const uuidv4 = require('uuid/v4');

module.exports = (app, MongoClient, mongoDBurl, mongodb) => {
	return {
		"configureRoutes": () => {

app.get('/', function (req, res) {
   console.log("Got a GET request for the homepage");
   res.send('Hello GET');
})		
		
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
					var sensor = {
						'sensorID': uuidv4(),
						'sensorReference': req.body.sensorReference,
						'sensorName': req.body.sensorName,
						'sensorFrames': []
					};
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
					var sensor = {
						'sensorID': uuidv4(),
						'sensorReference': req.body.sensorReference,
						'sensorName': req.body.sensorName,
						'sensorFrames': []
					};
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
							'sensorReference': result.sensors[i].sensorReference
						}
					}
					res.send(reply);
					console.log("Project details sent");
				})
			})
			
			app.get('/sensor?', function(req,res){
				var coll = "projects";
				var projectID = req.query.projectID ? req.query.projectID : 'No Project ID';
				var sensorID = req.query.sensorID ? req.query.sensorID : 'No Sensor ID';
				console.log("Sensor details requested");
				console.log(projectID);
				mongodb.collection(coll).findOne({'projectID': projectID}, function(err, result){
					if (err) throw err;
					var response = 0;
					var sensorIndex = result.sensors.findIndex(
						function(sense) {
							return sense.sensorID === sensorID
						}
					)
					response = result.sensors[sensorIndex]

					console.log(response);
					res.send(response);
					console.log("Project details sent");
				})
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
					var myObj = {};
					myObj["sensors."+sensorIndex] = {
						'sensorID': req.body.sensorID,
						'sensorReference': req.body.sensorReference,
						'sensorName': req.body.sensorName,
					};
					var myQuery = {
						"projectID": req.body.projectID
					}
					var newValues = {$set: myObj}
					mongodb.collection(coll).update(myQuery,newValues, function(err, result) {
						if (err) throw err;
						console.log(result);
						res.send(result);
					})
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
						console.log("Sensor deleted");
					})
				})
			})


		
		}
	}
}