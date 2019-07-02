"use strict";

//libs
const uuidv4  = require('uuid/v4');
const express = require('express');
const router  = new express.Router();
const knex    = require('../../db/knex');
const moment  = require('moment');
const projectHelper = require('../libs/helperFunctions.js')(knex);
const authenticaton = require('../libs/users.js')(knex);
	
function createBBInstance(req, index, ID){
	var boundingBox = {
		"bounding_box_id": uuidv4(),
		"global_index": -1,
		"shape": 0,
		"label": "",
		"temporal_attribute": "",
		"confidence": 0,
		"description": 'No description.',
		"points": {},
		"frame_id": req.body.frameID
	};
	if (ID != undefined) {
		boundingBox.bounding_box_id = ID;
	}
	if ( (req.body.shape != undefined) && (typeof req.body.shape === 'string') ){
		boundingBox.shape = req.body.shape;
	}
	if ( (index != undefined) && (typeof index === 'number') ){
		boundingBox.global_index = index;
	}
	if ( (req.body.confidence != undefined) && (typeof req.body.confidence === 'number') ){
		boundingBox.confidence = req.body.confidence;
	}
	if ( (req.body.description != undefined) && (typeof req.body.description === 'string') ){
		boundingBox.description = req.body.description;
	}
	if ( (req.body.primaryLabel != undefined) && (typeof req.body.primaryLabel === 'string') ){
		boundingBox.label = req.body.primaryLabel;
	}
	if ( (req.body.temporalAttribute != undefined) && (typeof req.body.temporalAttribute === 'string') ){
		boundingBox.temporal_attribute = req.body.temporalAttribute;
	}

	/*
	if ( (req.body.users != undefined) && (projectHelper.itemInArray(boundingBox.users[0], req.body.users) == -1) ){
		boundingBox.users = boundingBox.users.concat(req.body.users);
	} else if (req.body.users != undefined){
		boundingBox.users = req.body.users;
	}
	*/

	if (req.body.shape == 3) {						//polygon
		console.log("polygon");
		boundingBox.points = {
			data: []
		};
		/*
		for (var i=0; i<req.body.points.length; i++){
			var point = {
				"index": req.body.points[i].index,
				"x": req.body.points[i].x,
				"y": req.body.points[i].y
			}
			boundingBox.points.data[req.body.points[i].index] = point;
		}	
		*/
		boundingBox.points.data = req.body.points;				
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
			
			
/*
-------------------------------POST---------------------------------
*/			

router.post('/boundingBox', function(req,res){
/*
	console.log("adding frame to" + 
				req.body.projectID + 
				" >> "+ req.body.sensorID + 
				" >> "+ req.body.frameID
				);

		console.log(req.body)
		*/
	
	knex('frames')
	.where('frame_id', req.body.frameID)
	.first()
	.then(frame=>{
		//console.log(frame);
		if(frame){
			//console.log('found frame, will add new Boundary Box')
			//TODO: need a "global index"
			knex('bounding_boxes')
			.where('frame_id', req.body.frameID)
			.then(boxes=>{
				let new_box = createBBInstance(req, boxes.length, null);
				//console.log(new_box)
				knex('bounding_boxes')
				.insert(new_box)
				.returning(['*'])
				.then(box=>{
					//console.log("Bounding Box Saved");
					projectHelper.updateProjectDate(req.body.projectID);
					let reply = {
						boundingBoxID: box[0].bounding_box_id,
						frameID: box[0].frame_id
					};
					res.send(reply)
				})
				.catch(err=>{
					res.status(500).json({message: err.message, stack:err.stack});
				})
			})
		}
		else{
			throw new Error('frame not found!');
		}
	})
	.catch(err=>{
		res.status(500).json({message: err.message, stack:err.stack});
	})
});

/*
NOT USED
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

*/


/*
--------------------------------GET----------------------------
*/

router.get('/listBoundingBoxes',function(req,res){
	var coll = "projects";
	var projectID = req.query.projectID ? req.query.projectID : 'No Project ID';
	var sensorID = req.query.sensorID ? req.query.sensorID : 'No sensor ID';
	var frameID = req.query.frameID ? req.query.frameID : 'No Frame ID';
	//console.log("Bounding Boxes details requested");
	knex('bounding_boxes')
	.where('frame_id', frameID)
	.then(boxes=>{
		//TODO: authentication
		//console.log(boxes)
		let reply = [];
		for(let i=0; i<boxes.length; i++){
			//for each box we should put into reply with proper format bruh
			/*
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
			 */
			reply.push(
				{
					boundingBoxID: boxes[i].bounding_box_id,
					globalIndex: boxes[i].global_index,
					shape:boxes[i].shape,
					primaryLabel: boxes[i].label,
					secondaryLabel: [],
					temporalAttribute: boxes[i].temporal_attribute,
					confidence: boxes[i].confidence,
					lastUser: "me",
					description: boxes[i].description,
					users: "none",
					points: boxes[i].points.data || [],
					parameters: boxes[i].parameters
				}
			);
		}
		res.send(reply)
	})
	.catch(err=>{
		res.status(500).json({message: err.message, stack:err.stack});
	})
});

/*
NOT USED
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
*/
	
/*
NOT USED
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
*/

/*
------------------------------PUT-----------------------------
*/
			
router.put('/boundingBox',function(req,res){
	//TODO: authentication
	knex('bounding_boxes')
	.where('bounding_box_id', req.body.boundingBoxID)
	.first()
	.then(box => {
		const new_box = createBBInstance(req, box.global_index, req.body.boundingBoxID);
		knex('bounding_boxes')
		.where('bounding_box_id', req.body.boundingBoxID)
		.update(new_box)
		.then(()=>{
			//console.log('updated bounding box');
			projectHelper.updateProjectDate(req.body.projectID);
			res.status(200).json({
				"status": 'Ok',
				"message": 'Succesfully updated bounding box'
			});
		})
		.catch(err=>{
			res.status(500).json({message: 'Error', stack:err.stack});
		})
	})
	.catch(err=>{
		res.status(500).json({message: 'Error', stack:err.stack});
	})
});
			
/*
------------------------------DELETE-----------------------------
*/			
			
router.delete('/boundingBox',function(req,res){
	console.log('Updating frame: ' + req.body.frameID);
	//TODO: authentication
	knex('bounding_boxes')
	.where('frame_id', req.body.frameID)
	.orderBy('global_index')
	.then(boxes=>{
		//got all bounding boxes
		let boxes_to_keep = [];
		let global_index = 0;
		for(let i=0;i<boxes.length; i++){
			if(boxes[i].bounding_box_id != req.body.boundingBoxID){
				boxes[i].global_index = global_index;
				boxes_to_keep.push(boxes[i]);
				global_index++;
			}
		}
		//now we have all our good boxes
		knex('bounding_boxes')
		.where('frame_id', req.body.frameID)
		.delete() // delete all
		.then(()=>{
			knex('bounding_boxes')
			.insert(boxes_to_keep)
			.returning(['*'])
			.then((good_boxes)=>{
				console.log('boxes in frame')
				console.log(good_boxes)
				let reply = "some message"
				projectHelper.updateProjectDate(req.body.projectID);
				res.send(reply);
			})
			.catch(err => {
				res.status(500).json({message: 'Error', stack:err.stack});
			})
		})
		.catch(err => {
			res.status(500).json({message: 'Error', stack:err.stack});
		})
	})
	.catch(err => {
		res.status(500).json({message: 'Error', stack:err.stack});
	})
});
		
module.exports = router;