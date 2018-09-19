"use strict";

module.exports = (app, MongoClient, mongoDBurl) => {
	return {
		"configureRoutes": () => {
			app.put('/point?', function(req,res){
				var coll = "projects";
				console.log('Updating frame: ' + req.body.frameID);
				mongodb.collection(coll).findOne({'projectID': req.body.projectID}, function(err, result){
					var sensorIndex = result.sensors.findIndex(
						function(sense) {
							return sense.sensorID === req.body.sensorID
						}
					)
					console.log(sensorIndex);
					var frameIndex = result.sensors[sensorIndex].sensorFrames.findIndex(
						function(sensFrame) {
							return sensFrame.frameID === req.body.frameID
						}
					)
					console.log(frameIndex);

					var boundingBoxIndex = result.sensors[sensorIndex].sensorFrames[frameIndex].boundingBoxes.findIndex(
						function(boundingBox) {
							return boundingBox.boundingBoxID === req.body.boundingBoxID
						}
					)
					console.log(boundingBoxIndex);

					var myObj = {};
					var boundingBox = {
						"boundingBoxID": req.body.boundingBoxID,
						"shape": req.body.shape,
						"confidence": req.body.confidence,
						"points": [],
						"parameters": {}
					};
					if (req.body.shape == 1) {						//polygon
						console.log("polygon");
						for (var i=0; i<req.body.points.length; i++){
							var point = {
								"index": req.body.points[i].index,
								"x": req.body.points[i].x,
								"y": req.body.points[i].y
							}
							boundingBox.points[req.body.points[i].index] = point;
						}					
					}
					else if (req.body.shape == 2) {					//Rectangle/Square
						console.log("rectangle");
						var parameters = {
							"x1": req.body.parameters.x1,						//coordinate 1
							"y1": req.body.parameters.y1,
							"x2": req.body.parameters.x2,						//coordinate 2
							"y2": req.body.parameters.y2,
							"theta": req.body.parameters.theta
						}
						boundingBox.paramaeters = parameters;
					}
					else if (req.body.shape == 3) {					//Ellipse/circle
						console.log("ellipse");
						var parameters = {
							"x": req.body.parameters.x,						//center 
							"y": req.body.parameters.y,
							"a": req.body.parameters.a,						//major Radius
							"b": req.body.parameters.b,						//minor radius
							"theta": req.body.parameters.theta
						}
						boundingBox.paramaeters = parameters;
					}
					else {
						console.log("bounding box shape not found");
						return 0;
					}
					myObj["sensors."+sensorIndex+".sensorFrames."+frameIndex+".boundingBoxes."+boundingBoxIndex] = boundingBox;
					var myQuery = {
						"projectID": req.body.projectID
					}
					var newValues = {$set: myObj}
					mongodb.collection(coll).update(myQuery,newValues, function(err, result) {
						if (err) throw err;
						res.send(result);
					})
				})
			})
		
		}
	}
}