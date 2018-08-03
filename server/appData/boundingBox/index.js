"use strict";

//libs
const uuidv4 = require('uuid/v4');

module.exports = (app, MongoClient, mongoDBurl) => {
	return {
		"configureRoutes": () => {
			app.get('/boundingBox', function(req, res){
				var coll = "projects";
				var projectID = req.query.projectID ? req.query.projectID : 'No Project ID';
				var sensorID = req.query.sensorID ? req.query.sensorID : 'No Project ID';
				var frameID = req.query.frameID ? req.query.frameID : 'No Project ID';
				var boundingBoxID = req.query.boundingBoxID ? req.query.boundingBoxID : 'No Project ID';
				console.log("Project details requested");
				console.log(projectID);
				MongoClient.connect(mongoDBurl, function(err,db){
					if (err) throw err;
					var dbo = db.db("mydb");
					dbo.collection(coll).findOne({'projectID': projectID}, function(err, result){
						if (err) throw err;
						var sensorIndex = result.sensors.findIndex(
							function(sense){
								return sense.sensorID === sensorID
							}
						)
						var frameIndex = result.sensors[sensorIndex].sensorFrame.frameIndex(
							function(frameElement){
								return frameElement.frameID === frameID
							}
						)
						var boundingBoxIndex = result.sensors[sensorIndex].sensorFrame.frameIndex[frameID].boundingBox(
							function(boundingBoxElement){
								return boundingBoxElement.boundingBoxID === boundingBoxID
							}
						)
						console.log(result.sensors[sensorIndex].sensorFrame.frameIndex[frameID].boundingBox[boundingBoxID]);
						res.send(result.sensors[sensorIndex].sensorFrame.frameIndex[frameID].boundingBox[boundingBoxID]);
						console.log("Project details sent");
						db.close			
					})
				})			
			})
			
			
			app.post('/addBoundingBox', function(req,res){
				var coll = "projects";
				var reply;
				var project;
				var sensorFrame;
				console.log("adding frame to" + 
							req.body.projectID + 
							" >> "+ req.body.sensorID + 
							" >> "+ req.body.frameID);
				MongoClient.connect(mongoDBurl, function(err, db) {
					if (err) throw err;
					var dbo = db.db("mydb");
					var boundingBox = {
						"boundingBoxID": uuidv4(),
						"shape": req.body.BB1.shape,
						"confidence": req.body.confidence,
						"x1": req.body.BB1.x1,
						"y1": req.body.BB1.y1,
						"x2": req.body.BB1.x2,
						"y2": req.body.BB1.y2,
						
					};
					dbo.collection(coll).findOne({'projectID': req.body.projectID}, function(err, result) {
						if (err) throw err;
						project = result;
						var myquery = {'projectID' : project.projectID};
						var sensorIndex = project.sensors.findIndex(
							function(sense){
								return sense.sensorID === req.body.sensorID
							});
						console.log(project.sensors[sensorIndex].sensorFrame);
						var myFrame = project.sensors[sensorIndex].sensorFrame.findIndex(
							function(theFrame){
								return theFrame.frameID === req.body.frameID
							});
						var myObj = {};
						myObj["sensors."+sensorIndex+".sensorFrame."+myFrame+".boundingBox"] = boundingBox;
						var newValues = {$push: myObj};
						var myQuery = {'projectID' : project.projectID};
						dbo.collection(coll).updateOne(myQuery, newValues, function(err, result) {
							if (err) throw err;
							console.log("Bounding Box Saved");
							console.log(boundingBox);
							res.send(boundingBox);
							db.close				
						})
					})
				})
			})
			app.get('/boundingBoxes?', function(req,res){
				var coll = "projects";
				var projectID = req.query.projectID ? req.query.projectID : 'No Project ID';
				var sensorID = req.query.sensorID ? req.query.sensorID : 'No sensor ID';
				var frameID = req.query.frameID ? req.query.frameID : 'No Frame ID';
				console.log("Software details requested");
				console.log(projectID);
				MongoClient.connect(mongoDBurl, function(err,db){
					if (err) throw err;
					var dbo = db.db("mydb");
					dbo.collection(coll).findOne({'projectID': projectID}, function(err, result){
						if (err) throw err;
						var response = 0;
						var sensorIndex = result.sensors.findIndex(
							function(sense){
								return sense.sensorID === sensorID
							})
						var frameIndex = result.sensors[sensorIndex].sensorFrame.findIndex(
							function(frameElement){
								return frameElement.frameID === frameID
							})
						console.log(result.sensors[sensorIndex].sensorFrame[frameIndex]);
						/*
						for (var i = 0; i < result.sensors.length; i++) {
							if (result.sensors[i].sensorID == sensorID) {
								response = result.sensors[i]
							}
						}
						console.log(result);
					*/	res.send(result.sensors[sensorIndex].sensorFrame[frameIndex].boundingBox);
						console.log("Bounding Boxes sent");
						db.close			
					})
				})
			})

		
		}
	}
}