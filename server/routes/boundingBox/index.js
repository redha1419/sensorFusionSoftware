//libs
const uuidv4  = require('uuid/v4');
const express = require('express');
const router  = new express.Router();
const knex    = require('../../db/knex');
const moment  = require('moment');
const projectHelper = require('../libs/helperFunctions.js')(knex);
const authenticaton = require('../libs/users.js')(knex);
const _ = require('lodash')
	
function createBBInstance(req, index, ID){
	var boundingBox = {
		"bounding_box_id": uuidv4(),
		"global_index": -1,
		"shape": 0,
		"label": [],
		"attributes": {},
		"confidence": 0,
		"description": 'No description.',
		"points": {},
		"frame_id": req.body.frameID,
		"user_id": ""
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
	if ( (req.body.primaryLabel != undefined) && (typeof req.body.primaryLabel === 'object') ){
		boundingBox.label = req.body.primaryLabel;
	}
	if ( (req.body.attributes != undefined) && (typeof req.body.attributes === 'object') ){
		boundingBox.attributes = req.body.attributes;
	}
	if(req.body.user != undefined && (typeof req.body.user === 'string')){
		boundingBox.user_id = knex('users').where('username', req.body.user.toLowerCase()).select('user_id');
	}

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
	else if(req.body.shape == 4) {
		console.log("union");
		boundingBox.points = {
			data: [],
			crowded: []
		};
		boundingBox.points.data = req.body.points;		
		boundingBox.points.crowded = req.body.crowded;		
	}
	else if (req.body.shape == 1) {					//Rectangle/Square
		console.log("rectangle");
		let parameters = {
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
		let parameters = {
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

router.post('/boundingBoxes', function(req, res){

	console.log(req.body)
	knex('frames')
	.where('frame_id', req.body.frameID)
	.first()
	.then(frame=>{
		//console.log(frame);
		if(frame){
			//console.log('found frame, will add new Boundary Boxes')
			knex('bounding_boxes')
			.where('frame_id', req.body.frameID)
			.then(boxes=>{
				let box_index = boxes.length;
				let list_of_new_boxes = [];
				for(let i=0; i<req.body.boxes.length; i++)
				{
					let new_box = createBBInstance(req.boxes[i], box_index, req.body.boxes[i].bounding_box_id);
					list_of_new_boxes.push(new_box);
					box_index++;
				}
				//console.log(new_box)
				knex('bounding_boxes')
				.insert(list_of_new_boxes)
				.returning(['*'])
				.then(boxes => {
					console.log("Bounding Boxes Saved");
					projectHelper.updateProjectDate(req.body.projectID);
					let reply = {
						message:"success"
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

router.post('/boundingBox', function(req,res){
/*
	console.log("adding frame to" + 
				req.body.projectID + 
				" >> "+ req.body.sensorID + 
				" >> "+ req.body.frameID
				);

		console.log(req.body)
		*/
	console.log(req.body)
	knex('frames')
	.where('frame_id', req.body.frameID)
	.first()
	.then(frame=>{
		//console.log(frame);
		if(frame){
			//console.log('found frame, will add new Boundary Box')
			knex('bounding_boxes')
			.where('frame_id', req.body.frameID)
			.then(boxes=>{
				let new_box = createBBInstance(req, boxes.length, req.body.bounding_box_id);
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
--------------------------------GET----------------------------
*/

router.post('/listFilteredBoundingBoxes', function(req,res){
	console.log(req.body)
	//TODO: flatten labels ?, will lower complexity by n?
	let frameID = req.body.frameID;
	let labels = req.body.labels;
	//labels = JSON.parse(labels);
	knex('bounding_boxes')
	.where('frame_id', frameID)
	.join('users', 'users.user_id', '=', 'bounding_boxes.user_id')
	.orderBy('global_index')
	.select('bounding_boxes.*', 'users.username')
	.then(boxes=>{
		//TODO: authentication
		//labels = JSON.parse(labels)
		let reply = [];
		for(let i=0; i<boxes.length; i++){
			//for each box we should put into reply with proper format
			for(let j=0; j<labels.length; j++){
				let xor = _.xor(boxes[i].label, labels[j])
				console.log(xor)
				if(xor.length === 0){
					reply.push(
						{
							boundingBoxID: boxes[i].bounding_box_id,
							globalIndex: boxes[i].global_index,
							shape:boxes[i].shape,
							primaryLabel: boxes[i].label,
							secondaryLabel: [],
							attributes: boxes[i].attributes,
							confidence: boxes[i].confidence,
							description: boxes[i].description,
							points: boxes[i].points.data || [],
							parameters: boxes[i].parameters,
							originalUser: boxes[i].username
						}
					);
				}
			}
		}
		res.send(reply)
	})
	.catch(err=>{
		res.status(500).json({message: err.message, stack:err.stack});
	})
})

router.get('/listBoundingBoxes',function(req,res){
	let frameID = req.query.frameID ? req.query.frameID : 'No Frame ID';
	//console.log("Bounding Boxes details requested");
	knex('bounding_boxes')
	.where('frame_id', frameID)
	.join('users', 'users.user_id', '=', 'bounding_boxes.user_id')
	.orderBy('global_index')
	.select('bounding_boxes.*', 'users.username')
	.then(boxes=>{
		//TODO: authentication
		//console.log(boxes)
		let reply = [];
		for(let i=0; i<boxes.length; i++){
			//for each box we should put into reply with proper format
			reply.push(
				{
					boundingBoxID: boxes[i].bounding_box_id,
					globalIndex: boxes[i].global_index,
					shape:boxes[i].shape,
					primaryLabel: boxes[i].label,
					attributes: boxes[i].attributes,
					confidence: boxes[i].confidence,
					description: boxes[i].description,
					points: boxes[i].points.data || [],
					crowded: boxes[i].points.crowded || [],
					parameters: boxes[i].parameters,
					originalUser: boxes[i].username
				}
			);
		}
		res.send(reply)
	})
	.catch(err=>{
		res.status(500).json({message: err.message, stack:err.stack});
	})
});

router.get('/listBoundingBoxesAll',function(req,res){
	//get all bounding boxes in frames given sensor id and project id
	let projectID = req.query.projectID ? req.query.projectID : 'No Project ID';
	let sensorID = req.query.sensorID ? req.query.sensorID : 'No Sensor ID';
	//console.log("Bounding Boxes details requested");
	knex('sensors')
	.where('project_id', projectID)
	.where('sensor_id', sensorID)
	.then(sensor =>{
		//just to validate if project and sensor is correct
		if(sensor){
			knex('frames')
			.where('sensor_id', sensorID)
			.leftJoin('bounding_boxes', 'frames.frame_id', '=', 'bounding_boxes.frame_id')
			.join('users', 'users.user_id', '=', 'bounding_boxes.user_id')
			.orderBy('global_index')
			.select('frames.frame_id','frames.frame_name','bounding_boxes.bounding_box_id', 'bounding_boxes.shape', 'bounding_boxes.description' ,'bounding_boxes.label','bounding_boxes.points' ,'users.username')
			.then(frames=>{
				console.log("\n\n\n GOT ALL BBs for SENSOR \n\n\n");
				res.status(200).json(frames);
			})
			.catch(err=>{
				res.status(500).json({message: err.message, stack:err.stack});
			})
		}
	})
	.catch(err=>{
		res.status(500).json({message: err.message, stack:err.stack});
	})
});

router.get('/listUserBoundingBox', function(req, res){
	knex('bounding_boxes')
	.where('frame_id', req.query.frameID)
	.where('user_id', knex('users').where('username', req.query.user.toLowerCase()).select('user_id'))
	.orderBy('global_index')
	.then(boxes => {
		//TODO: authentication
		//console.log(boxes)
		let reply = [];
		for(let i=0; i<boxes.length; i++){
			reply.push(
				{
					boundingBoxID: boxes[i].bounding_box_id,
					globalIndex: boxes[i].global_index,
					shape:boxes[i].shape,
					primaryLabel: boxes[i].label,
					attributes: boxes[i].attributes,
					confidence: boxes[i].confidence,
					description: boxes[i].description,
					points: boxes[i].points.data || [],
					parameters: boxes[i].parameters,
					originalUser: req.query.user.toLowerCase()
				}
			);
		}
		res.send(reply)
	})
	.catch(err=>{
		res.status(500).json({message: err.message, stack:err.stack});
	})
});

router.get('/getLatestBoundingBox', function(req,res){
	knex('bounding_boxes')
	.where('frame_id', req.query.frameID)
	.orderBy('global_index', 'desc')
	.first()
	.then(boundingBox=>{
		res.send({
			boundingBoxID: boundingBox.bounding_box_id,
			globalIndex: boundingBox.global_index,
			shape:boundingBox.shape,
			primaryLabel: boundingBox.label,
			attributes: boundingBox.attributes,
			confidence: boundingBox.confidence,
			description: boundingBox.description,
			points: boundingBox.points.data || [],
			parameters: boundingBox.parameters,
		})
	})
	.catch(err=>{
		console.log(err)
		res.status(403).json({message: "no bounding box found"})
	})
});

/*
------------------------------PUT-----------------------------
*/
			
router.put('/boundingBox',function(req,res){
	
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
		console.log('number of boxes in frame before')
		console.log(boxes.length)
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
			if(boxes_to_keep.length > 0){
				knex('bounding_boxes')
				.insert(boxes_to_keep)
				.returning(['*'])
				.then((good_boxes)=>{
					console.log('number of boxes in frame after')
					console.log(good_boxes.length)
					let reply = "some message"
					projectHelper.updateProjectDate(req.body.projectID);
					res.send(reply);
				})
				.catch(err => {
					res.status(500).json({message: 'Error', stack:err.stack});
				})
			}
			else {
				let reply = "some message"
				res.send(reply);
			}
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