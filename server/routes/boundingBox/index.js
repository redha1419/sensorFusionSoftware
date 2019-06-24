"use strict";

//libs
const uuidv4 = require('uuid/v4');


module.exports = (app, MongoClient, mongoDBurl, mongodb) => {

	const projectHelper = require('../libs/helperFunctions.js.js')(mongodb);
	const authenticaton = require('../libs/users.js.js')(mongodb);
		
	function createBBInstance(req, index, ID){
		var boundingBox = {
			"boundingBoxID": uuidv4(),
			"globalIndex": -1,
			"shape": 0,
			"primaryLabel": "",
			"secondaryLabel": [],
			"temporalAttribute": "",
			"confidence": 0,
			"lastUser": authenticaton.getUser(req),
			"description": 'No description.',
			"users": [authenticaton.getUser(req)],
			"points": [],
			"parameters": {}
		};
		if (ID != undefined) {
			boundingBox.boundingBoxID = ID;
		}
		if ( (req.body.shape != undefined) && (typeof req.body.shape === 'string') ){
			boundingBox.shape = req.body.shape;
		}
		if ( (index != undefined) && (typeof index === 'number') ){
			boundingBox.globalIndex = index;
		}
		if ( (req.body.confidence != undefined) && (typeof req.body.confidence === 'number') ){
			boundingBox.confidence = req.body.confidence;
		}
		if ( (req.body.description != undefined) && (typeof req.body.description === 'string') ){
			boundingBox.description = req.body.description;
		}
		if ( (req.body.primaryLabel != undefined) && (typeof req.body.primaryLabel === 'string') ){
			boundingBox.primaryLabel = req.body.primaryLabel;
		}
		if ( (req.body.secondaryLabel != undefined) && ( Array.isArray(req.body.secondaryLabel) ) ){
			boundingBox.secondaryLabel = req.body.secondaryLabel;
		}
		if ( (req.body.temporalAttribute != undefined) && (typeof req.body.temporalAttribute === 'string') ){
			boundingBox.temporalAttribute = req.body.temporalAttribute;
		}
		if ( (req.body.users != undefined) && (projectHelper.itemInArray(boundingBox.users[0], req.body.users) == -1) ){
			boundingBox.users = boundingBox.users.concat(req.body.users);
		} else if (req.body.users != undefined){
			boundingBox.users = req.body.users;
		}
		console.log(req.body.parameters);
		if (req.body.shape == 3) {						//polygon
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
		else if (req.body.shape == 1) {					//Rectangle/Square
			console.log("rectangle");
			var parameters = {
				"x1": req.body.parameters.x1,						//coordinate 1
				"y1": req.body.parameters.y1,
				"x2": req.body.parameters.x2,						//coordinate 2
				"y2": req.body.parameters.y2,
				"cx": req.body.parameters.cx,						//coordinate 2
				"cy": req.body.parameters.cy
			}
			boundingBox.parameters = parameters;
		}
		else if (req.body.shape == 2) {							//Ellipse/circle
			console.log("ellipse");
			var parameters = {
				"x": req.body.parameters.x,						//center 
				"y": req.body.parameters.y,
				"a": req.body.parameters.a,						//major Radius
				"b": req.body.parameters.b,						//minor radius
				"theta": req.body.parameters.theta
			}
			boundingBox.parameters = parameters;
		}
		else {
			console.log("bounding box shape not found");
			return null;
		}
		return boundingBox;
	}

    
    return {
		"configureRoutes": () => {
			
			
/*
-------------------------------POST---------------------------------
*/			

			app.post('/boundingBox', function(req,res){
				var coll = "projects";
				var reply;
				var project;
				var sensorFrames;
				console.log("adding frame to" + 
							req.body.projectID + 
							" >> "+ req.body.sensorID + 
							" >> "+ req.body.frameID);

				mongodb.collection(coll).findOne({'projectID': req.body.projectID}, function(err, result) {
					if (err) throw err;
					project = result;
					var myquery = {'projectID' : project.projectID};
					var sensorIndex = project.sensors.findIndex(
						function(sense){
							return sense.sensorID === req.body.sensorID
						});
					console.log(project.sensors[sensorIndex].sensorFrames);
					var myFrame = project.sensors[sensorIndex].sensorFrames.findIndex(
						function(theFrame){
							return theFrame.frameID === req.body.frameID
						});
					var myObj = {};
					var index = project.sensors[sensorIndex].sensorFrames[myFrame].boundingBoxes.length;
					myObj["sensors."+sensorIndex+".sensorFrames."+myFrame+".boundingBoxes"] = createBBInstance(req, index, null);
					var newValues = {$push: myObj};
					var myQuery = {'projectID' : project.projectID};
					mongodb.collection(coll).updateOne(myQuery, newValues, function(err, result) {
						if (err) throw err;
						console.log("Bounding Box Saved");
                        projectHelper.updateProjectDate(req.body.projectID);
                        res.send(myObj["sensors."+sensorIndex+".sensorFrames."+myFrame+".boundingBoxes"]);
					})
				})
			})
			app.post('/addBoundingBox', function(req,res){
				var coll = "projects";
				var reply;
				var project;
				var sensorFrames;
				console.log("adding frame to" + 
							req.body.projectID + 
							" >> "+ req.body.sensorID + 
							" >> "+ req.body.frameID);
				var boundingBox = {
					"boundingBoxID": uuidv4(),
					"shape": req.body.BB1.shape,
                    "confidence": req.body.confidence,
                    "description": req.body.description,

					"x1": req.body.BB1.x1,
					"y1": req.body.BB1.y1,
					"x2": req.body.BB1.x2,
					"y2": req.body.BB1.y2,
					
				};
				mongodb.collection(coll).findOne({'projectID': req.body.projectID}, function(err, result) {
					if (err) throw err;
					project = result;
					var myquery = {'projectID' : project.projectID};
					var sensorIndex = project.sensors.findIndex(
						function(sense){
							return sense.sensorID === req.body.sensorID
						});
					console.log(project.sensors[sensorIndex].sensorFrames);
					var myFrame = project.sensors[sensorIndex].sensorFrames.findIndex(
						function(theFrame){
							return theFrame.frameID === req.body.frameID
						});
					var myObj = {};
					myObj["sensors."+sensorIndex+".sensorFrames."+myFrame+".boundingBoxes"] = boundingBox;
					var newValues = {$push: myObj};
					var myQuery = {'projectID' : project.projectID};
					mongodb.collection(coll).updateOne(myQuery, newValues, function(err, result) {
						if (err) throw err;
						console.log("Bounding Box Saved");
                        projectHelper.updateProjectDate(req.body.projectID);
                        res.send(boundingBox);
					})
				})
			})


/*
--------------------------------GET----------------------------
*/
			app.get('/listBoundingBoxes',function(req,res){
				var coll = "projects";
				var projectID = req.query.projectID ? req.query.projectID : 'No Project ID';
				var sensorID = req.query.sensorID ? req.query.sensorID : 'No sensor ID';
				var frameID = req.query.frameID ? req.query.frameID : 'No Frame ID';
				console.log("Bounding Boxes details requested");
				mongodb.collection(coll).findOne({'projectID': projectID}, function(err, result){
					if (err) throw err;
					var response = 0;
					var sensorIndex = result.sensors.findIndex(
						function(sense){
							return sense.sensorID === sensorID
						})
					var frameIndex = result.sensors[sensorIndex].sensorFrames.findIndex(
						function(frameElement){
							return frameElement.frameID === frameID
						})
					if (projectHelper.itemInArray(
									authenticaton.getUser(req), 
									result.sensors[sensorIndex].sensorFrames[frameIndex].users) >= 0){
						res.send(result.sensors[sensorIndex].sensorFrames[frameIndex].boundingBoxes); //res.send(response);
						console.log("Bounding Boxes sent");
					}else{
						res.send({'error' : "unauthorized"});
					}
					
						
				})
			})
			app.get('/numberOfBoundingBoxes',function(req,res){
				var coll = "projects";
				var projectID = req.query.projectID ? req.query.projectID : 'No Project ID';
				var sensorID = req.query.sensorID ? req.query.sensorID : 'No sensor ID';
				var frameID = req.query.frameID ? req.query.frameID : 'No Frame ID';
				console.log("Bounding Boxes details requested");
				mongodb.collection(coll).findOne({'projectID': projectID}, function(err, result){
					if (err) throw err;
					var response = 0;
					var sensorIndex = result.sensors.findIndex(
						function(sense){
							return sense.sensorID === sensorID
						})
					var frameIndex = result.sensors[sensorIndex].sensorFrames.findIndex(
						function(frameElement){
							return frameElement.frameID === frameID
						})
					if (projectHelper.itemInArray(
									authenticaton.getUser(req), 
									result.sensors[sensorIndex].sensorFrames[frameIndex].users) >= 0){
						res.send(result.sensors[sensorIndex].sensorFrames[frameIndex].boundingBoxes.length); //res.send(response);
						console.log(result.sensors[sensorIndex].sensorFrames[frameIndex].boundingBoxes.length);
					}else{
						res.send({'error' : "unauthorized"});
					}
					
						
				})
			})
			
			app.get('/boundingBox?', function(req,res){
				var coll = "projects";
				var projectID = req.query.projectID ? req.query.projectID : 'No Project ID';
				var sensorID = req.query.sensorID ? req.query.sensorID : 'No sensor ID';
				var frameID = req.query.frameID ? req.query.frameID : 'No Frame ID';
				var boundingBoxID = req.query.boundingBoxID ? req.query.boundingBoxID : 'No bounding box ID';
				console.log("Software details requested");
				console.log(authenticaton.getPermission(req));
				if (authenticaton.getPermission(req).read == 'true') {
					mongodb.collection(coll).findOne({'projectID': projectID}, function(err, result){
						if (err) throw err;
						var response = 0;
						var sensorIndex = result.sensors.findIndex(
							function(sense){
								return sense.sensorID === sensorID
							})
						var frameIndex = result.sensors[sensorIndex].sensorFrames.findIndex(
							function(frameElement){
								return frameElement.frameID === frameID
							})
						var boundingBoxIndex = result.sensors[sensorIndex].sensorFrames[frameIndex].boundingBoxes.findIndex(
							function(boundingBoxElement){
								return boundingBoxElement.boundingBoxID === boundingBoxID
							})
						if (projectHelper.itemInArray(
										authenticaton.getUser(req), 
										result.sensors[sensorIndex].sensorFrames[frameIndex].boundingBoxes[boundingBoxIndex].users) >= 0){
							res.send(result.sensors[sensorIndex].sensorFrames[frameIndex].boundingBoxes[boundingBoxIndex]);
							console.log("Bounding Boxes sent");
						}else{
							res.send({'error' : "unauthorized"});
						}
						
					})
				} else {
					res.send({'error' : "unauthorized"});

				}
			})
/*
------------------------------PUT-----------------------------
*/
			
			app.put('/boundingBox',function(req,res){
				var coll = "projects";
				console.log('Updating frame: ' + req.body.frameID);
				if (authenticaton.getPermission(req).write == 'true') {
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
						var index = result.sensors[sensorIndex].sensorFrames[frameIndex].boundingBoxes[boundingBoxIndex].globalIndex;
						var boundingBox = createBBInstance(req, index, req.body.boundingBoxID);
						
						
						myObj["sensors."+sensorIndex+".sensorFrames."+frameIndex+".boundingBoxes."+boundingBoxIndex] = boundingBox;
						var myQuery = {
							"projectID": req.body.projectID
						}
						var newValues = {$set: myObj}
						if (projectHelper.itemInArray(
										authenticaton.getUser(req), 
										result.sensors[sensorIndex].sensorFrames[frameIndex].boundingBoxes[boundingBoxIndex].users) >= 0){
						
							mongodb.collection(coll).update(myQuery,newValues, function(err, result) {
								if (err) throw err;
								projectHelper.updateProjectDate(req.body.projectID);
								res.send(result);
							})
						} else {
							res.send({'error' : "unauthorized"});
						}
					})
				} else {
					res.send({'error' : "unauthorized"});

				}
				
			})
			
/*
------------------------------DELETE-----------------------------
*/			
			
			app.delete('/boundingBox',function(req,res){
				var coll = "projects";
				console.log('Updating frame: ' + req.body.frameID);
				if (authenticaton.getPermission(req).write == 'true') {
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
						
						var boundingBoxesOld = result.sensors[sensorIndex].sensorFrames[frameIndex].boundingBoxes;
						var boundingBoxesNew = [];
						var BBIDnew = 0;
						
						for (var BBID = 0; BBID < boundingBoxesOld.length; BBID++){
							if(boundingBoxesOld[BBID].boundingBoxID != req.body.boundingBoxID){
								boundingBoxesNew[BBIDnew] = boundingBoxesOld[BBID];
								boundingBoxesNew[BBIDnew].globalIndex = BBIDnew;
								BBIDnew++;
								
							}
						}

						var myObj = {};
						
						myObj["sensors."+sensorIndex+".sensorFrames."+frameIndex+".boundingBoxes"] = boundingBoxesNew;
						var myQuery = {
							"projectID": req.body.projectID
						}
						var newValues = {$set: myObj}
						if (projectHelper.itemInArray(
										authenticaton.getUser(req), 
										result.sensors[sensorIndex].sensorFrames[frameIndex].boundingBoxes[boundingBoxIndex].users) >= 0){
						
							mongodb.collection(coll).update(myQuery,newValues, function(err, result) {
								if (err) throw err;
								projectHelper.updateProjectDate(req.body.projectID);
								res.send(result);
							})
						} else {
							res.send({'error' : "unauthorized"});
						}
					})
				} else {
					res.send({'error' : "unauthorized"});

				}
				
			})
		
		}
	}
}