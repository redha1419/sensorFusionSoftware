"use strict";

//libs
const uuidv4 = require('uuid/v4');

module.exports = (app, MongoClient, mongoDBurl) => {
	return {
		"configureRoutes": () => {

			app.post('/addFrame', function(req, res){
				var coll = "projects";
				var reply;
				var project;
				var sensorFrame;
			   console.log("adding frame to"+req.body.projectID+">>"+req.body.sensorID);
			   console.log(req.body);
			   MongoClient.connect(mongoDBurl, function(err, db) {
					var dbo = db.db("mydb");
					if (err) throw err;
					dbo.collection(coll).findOne({'projectID': req.body.projectID }, function( err, result) {
						if (err) throw err;
						project = result;
						var myquery = {'projectID' : project.projectID};
						sensorFrame = {
							'frameID': uuidv4(),
							'frameName': req.body.frameName,
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
						myObj["sensors."+mySensor+".sensorFrame"] = sensorFrame;
						var newvalues = {$push: myObj};
						dbo.collection(coll).updateOne(myquery, newvalues, function(err, result) {
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
						   "frameID": sensorFrame.frameID 
						};
					//	console.log(reply);
						res.send(reply);
						db.close
						})
					});
			   })
			})		
		
		}
	}
}