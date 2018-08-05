"use strict";

//libs
const uuidv4 = require('uuid/v4');

module.exports = (app, MongoClient, mongoDBurl) => {
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
			   MongoClient.connect(mongoDBurl, function(err, db) {
					var dbo = db.db("mydb");
					if (err) throw err;
					dbo.collection(coll).findOne({'projectID': req.body.projectID }, function( err, result) {
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
						dbo.collection(coll).updateOne(myquery, newvalues, function(err, result) {
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
						db.close
						})
					});
			   })
			})
			app.post('/addSensor', function(req, res){
				var coll = "projects";
				var reply;
				var project;
			   console.log("adding sensor to"+req.body.projectID);
			   MongoClient.connect(mongoDBurl, function(err, db) {
					var dbo = db.db("mydb");
					if (err) throw err;
					dbo.collection(coll).findOne({'projectID': req.body.projectID }, function( err, result) {
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
						dbo.collection(coll).updateOne(myquery, newvalues, function(err, result) {
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
						db.close
						})
					});
			   })
			})

/*
------------------------------------GET------------------------------------------
*/			
			app.get('/listSensors?', function(req,res){
				var coll = "projects";
				var projectID = req.query.projectID ? req.query.projectID : 'No Project ID';
				console.log("Sensor details requested in project " + projectID);
				console.log(projectID);
				MongoClient.connect(mongoDBurl, function(err,db){
					if (err) throw err;
					var dbo = db.db("mydb");
					dbo.collection(coll).findOne({'projectID': projectID}, function(err, result){
						if (err) throw err;
						var reply = [{}];
						for (var i = 0; i < result.sensors.length; i++) {
							reply[i] = {
								'sensorName': result.sensors[i].sensorName,
								'sensorID': result.sensors[i].sensorID,
								'sensorReference': result.sensors[i].sensorReference
							}
						}
						console.log(reply);
						res.send(reply);
						console.log("Project details sent");
						db.close			
					})
				})
			})
			
			app.get('/sensor?', function(req,res){
				var coll = "projects";
				var projectID = req.query.projectID ? req.query.projectID : 'No Project ID';
				var sensorID = req.query.sensorID ? req.query.sensorID : 'No Sensor ID';
				console.log("Sensor details requested");
				console.log(projectID);
				MongoClient.connect(mongoDBurl, function(err,db){
					if (err) throw err;
					var dbo = db.db("mydb");
					dbo.collection(coll).findOne({'projectID': projectID}, function(err, result){
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
						db.close		
					})
				})
			})
/*
-------------------------------PUT--------------------------------
*/			

			app.put('/sensor',function(req,res){
				var coll = "projects";
				console.log('Updating Sensor: ' + req.body.sensorID);
				MongoClient.connect(mongoDBurl, function(err,db){
					if (err) throw err;
					var dbo = db.db("mydb");
					dbo.collection(coll).findOne({'projectID': req.body.projectID}, function(err, result){
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
						dbo.collection(coll).update(myQuery,newValues, function(err, result) {
							if (err) throw err;
							console.log(result);
							res.send(result);
							db.close();
						})
	
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
				MongoClient.connect(mongoDBurl, function(err,db){
					if (err) throw err;
					var dbo = db.db("mydb");
					dbo.collection(coll).findOne({'projectID': projectID}, function(err, result){
						if (err) throw err;
						//console.log(result);
						var sensors = result.sensors;
						var removeSensorIndex = result.sensors.findIndex(
							function(sense) {
								return sense.sensorID === sensorID
							}
						);
						sensors.splice(removeSensorIndex,1);
						console.log(sensors);
						console.log('----------');
						//res.send(sensors);
						var myobj = {};
						myobj["sensors"] = sensors;
						console.log(myobj);
						var newValues = {$set: myobj};
						var myQuery = {"projectID" : projectID};
						dbo.collection(coll).updateOne(myQuery, newValues, function(err, result){
							if (err) throw err;
							console.log("Sensor deleted");
							db.close	
						})
									
					})
				})	
				
			})


		
		}
	}
}