//libs
const uuidv4  = require('uuid/v4');
const express = require('express');
const router  = new express.Router();
const knex    = require('../../db/knex');
const moment  = require('moment');
const projectHelper = require('../libs/helperFunctions.js')(knex);
const authenticaton = require('../libs/users.js')(knex);
	
function createFrameInstance(req, ID){
	var sensorFrame = {
		'frame_id': uuidv4(),
		'frame_name': req.body.frameName,
		'description': req.body.description || "",
		'translation_data': {
			"x": "",
			"y": "",
			"z": "",
			"alpha": "",
			"beta": "",
			"gama": "",
			"time": ""
		},
		'sensor_id': req.body.sensorID
	};
	if (ID != undefined) {
		sensorFrame.frame_id = ID;
	}
	/*
	if ( (req.body.users != undefined) && (projectHelper.itemInArray(sensorFrame.users[0], req.body.users) == -1) ){
		sensorFrame.users = sensorFrame.users.concat(req.body.users);
	} else if (req.body.users != undefined){
		sensorFrame.users = req.body.users;
	}
	*/
	if ( (req.body.description != undefined) && (typeof req.body.description === 'string') ){
		sensorFrame.description = req.body.description;
	}
	if ( (req.body.frameName != undefined) && (typeof req.body.frameName === 'number') ){
		sensorFrame.frame_name = req.body.frameName;
	}
	
	if (req.body.translation != undefined) {
		// default to origin
		if ( (req.body.translation.x != undefined) && (typeof req.body.translation.x === 'number') ){
			sensorFrame.translation.x  = req.body.translation.x;
		}
		else {
			sensorFrame.translation.x  = 0;
		}
		if ( (req.body.translation.y != undefined) && (typeof req.body.translation.y === 'number') ){
			sensorFrame.translation.y  = req.body.translation.y;
		}
		else {
			sensorFrame.translation.y  = 0;
		}
		if ( (req.body.translation.z != undefined) && (typeof req.body.translation.z === 'number') ){
			sensorFrame.translation.z = req.body.translation.z;
		}
		else {
			sensorFrame.translation.z  = 0;
		}
		if ( (req.body.translation.alpha != undefined) && (typeof req.body.translation.alpha === 'number') ){
			sensorFrame.translation.alpha  = req.body.translation.alpha;
		}
		else {
			sensorFrame.translation.alpha  = 0;
		}
		if ( (req.body.translation.beta != undefined) && (typeof req.body.translation.beta === 'number') ){
			sensorFrame.translation.beta  = req.body.translation.beta;
		}
		else {
			sensorFrame.translation.beta  = 0;
		}
		if ( (req.body.translation.gama != undefined) && (typeof req.body.translation.gama === 'number') ){
			sensorFrame.translation.gama  = req.body.translation.gama;
		}
		else {
			sensorFrame.translation.gama  = 0;
		}
		if ( (req.body.translation.time != undefined) && (typeof req.body.translation.time === 'number') ){
			sensorFrame.translation.time  = req.body.translation.time;
		}
		else {
			sensorFrame.translation.time  = 0;
		}
	}		
	return sensorFrame;
}

/*
-------------------------------POST----------------------------
*/		

router.post('/frame', function(req, res){
	console.log("adding frame to"+req.body.projectID+">>"+req.body.sensorID);
	//console.log(req.body);
	knex('projects')
	.where('project_id', req.body.projectID)
	.first()
	.then(project =>{
		knex('sensors')
		.where('sensor_id', req.body.sensorID)
		.first()
		.then(sensor => {
			let frame = createFrameInstance(req);
			console.log(frame)
			knex('frames')
			.insert(frame)
			.returning(['*'])
			.then(frames => {
				console.log("Frame Saved");
				//const dotNotationName = "sensors." + mySensor + ".sensorName";
				let reply = {
					"insertedCount": frames.length,
					"collection": 'projects',
					"projectName": project.project_name,
					"projectID": project.project_id,
					//"sensorName": dotNotationName,
					"sensorID": frames[0].sensor_id,
					"frameName": frames[0].frame_name,
					"description": frames[0].description,
					"frameID": frames[0].frame_id 
				};
				projectHelper.updateProjectDate(req.body.projectID);
				res.send(reply);
			})
			.catch(err=>{
				console.log(err)
			})
		})
	})
	.catch(err=>{
		console.log(err)
	})
});

router.post('/matchFrame', function(req, res){
	const origFrameID = req.body.origFrameID;
	const newFrameID = req.body.newFrameID;
	console.log(req.body)
	knex('bounding_boxes')
	.where('frame_id', origFrameID)
	.then(data=>{
		if (data.length > 0){
			//go through the data and correct their frame affiliation
			for(let i=0; i<data.length; i++){
				data[i].frame_id = newFrameID;
				data[i].bounding_box_id = uuidv4(); //some new if for each box lol
				delete data[i].id //remove postgres id, will be automatically re-gened
			}
			//give "data" to our new bnounding boxes
			knex('bounding_boxes')
			.where('frame_id', newFrameID)
			.delete()
			.then(()=>{
				console.log('deleted all bounding boxes associated with frame: ' + newFrameID)
				knex('bounding_boxes')
				.insert(data)
				.then(()=>{
					console.log('updated the frame ' + newFrameID + ' with new boxes')
					res.status(200).json({message: 'succesfully updated frames'})
				})
				.catch(err=>{
					res.status(500).json({message: err.message, stack:err.stack});
				})
			})
			.catch(err=>{
				res.status(500).json({message: err.message, stack:err.stack});
			})
		}
		else{
			console.log('updated the frame ' + newFrameID + ' with new boxes')
			res.status(200).json({message: 'succesfully updated frames'})
		}
	})
	.catch(err=>{
		res.status(500).json({message: err.message, stack:err.stack});
	})

})

router.post('/removeFrame', function(req,res){
	const projectID = req.query.projectID ? req.query.projectID : 'No Project ID';
	let subquery = knex('bounding_boxes').select('bounding_boxes.frame_id');
	knex('frames')
	.join('sensors', 'sensors.sensor_id', '=', 'frames.sensor_id')
	.select('sensors.project_id')
	.where('sensors.project_id', projectID)
	.where('frames.frame_id', 'not in', subquery)
	.del()
	.then(()=>{
		console.log('deleted all frames with out boxes on project ' + projectID + ' ... hopefully');
		res.status(200).json({message: 'succesfully updated frames'})
	})
	.catch(err=>{
		res.status(500).json({message: err.message, stack:err.stack});
	})
});

/*
-------------------------------GET--------------------------
*/

router.get('/getFrame', function(req,res){
	const projectID = req.query.projectID ? req.query.projectID : 'No Project ID';
	const sensorID = req.query.sensorID ? req.query.sensorID : 'No Sensor ID';
	const frameName = req.query.frameName ? req.query.frameName : 'No Frame Name';
	knex('sensors')
	.where('project_id', projectID)
	.where('sensor_id', sensorID)
	.first()
	.then(sensor =>{
		//just to validate if project and sensor is correct
		if(sensor){
			knex('frames')
			.where('sensor_id', sensorID)
			.where('frame_name', frameName) // assuming unique
			.first()
			.then(frame=>{
				let reply = {frameName: frame.frame_name, frameID: frame.frame_id, description: frame.description};
				res.status(200).json(reply);
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

router.get('/listFrames?',function(req,res){
	const projectID = req.query.projectID ? req.query.projectID : 'No Project ID';
	const sensorID = req.query.sensorID ? req.query.sensorID : 'No Sensor ID';
	knex('sensors')
	.where('project_id', projectID)
	.where('sensor_id', sensorID)
	.first()
	.then(sensor => {
		console.log('Found sensor in question: ', projectID, sensorID)
		console.log(sensor);
		knex('frames')
		.where('sensor_id', sensorID)
		.select('frames.frame_id', 'frames.frame_name', 'frames.description')
		.orderBy('frame_name')
		.then(frames=>{
			//TODO: authentication!
			let reply= [];
			for(let i=0; i<frames.length; i++){
				reply.push(
					{
						'frameName': frames[i].frame_name,
						'frameID': frames[i].frame_id,
						'description': frames[i].description
					}
				);
			}
			console.log('list of frames');
			console.log(reply);
			res.send(reply);
		})
		.catch(err=>{
			res.status(500).json({message: err.message, stack:err.stack});
		})
		console.log("Frame details sent");
	})
	.catch(err => {
		res.status(500).json({message: err.message, stack:err.stack});
	})
});

module.exports = router;