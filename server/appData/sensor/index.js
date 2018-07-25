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
							'sensorFrame': []
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
								'projectName': result.sensors[i],
								'projectID': result.sensors[i]
							}
						}
						console.log(result.sensors);
						res.send(result.sensors);
						console.log("Project details sent");
						db.close			
					})
				})
			})
			
			app.get('/sensor?', function(req,res){
				var coll = "projects";
				var projectID = req.query.projectID ? req.query.projectID : 'No Project ID';
				var sensorID = req.query.sensorID ? req.query.sensorID : 'No Sensor ID';
				console.log("Software details requested");
				console.log(projectID);
				MongoClient.connect(mongoDBurl, function(err,db){
					if (err) throw err;
					var dbo = db.db("mydb");
					dbo.collection(coll).findOne({'projectID': projectID}, function(err, result){
						if (err) throw err;
						var response = 0;
						for (var i = 0; i < result.sensors.length; i++) {
							if (result.sensors[i].sensorID == sensorID) {
								response = result.sensors[i]
							}
						}
						console.log(result);
						res.send(result);
						console.log("Project details sent");
						db.close			
					})
				})
			})
			
		
		}
	}
}