"use strict";

module.exports = (app, MongoClient, mongoDBurl, mongodb) => {
	return {
		"configureRoutes": () => {
			app.put('/point',function(req,res){
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
					if (result.sensors[sensorIndex].sensorFrames[frameIndex].boundingBoxes[boundingBoxIndex].shape == 0) {
						var pointIndex = result.sensors[sensorIndex].sensorFrames[frameIndex].boundingBoxes[boundingBoxIndex].points.findIndex(
							function(point) {
								return point.index === req.body.index
							}
						)
						console.log(pointIndex);
					}
					else {
						console.log("not a polygon");
					}		

					var myObj = {};
					var point = {
						"index": req.body.index,
						"x": req.body.x,
						"y": req.body.y
					};
					myObj["sensors."+sensorIndex+".sensorFrames."+frameIndex+".boundingBoxes."+boundingBoxIndex+".points."+pointIndex] = point;
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