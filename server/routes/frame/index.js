"use strict";

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
		'description': req.body.description,
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
	if ( (req.body.frameName != undefined) && (typeof req.body.frameName === 'string') ){
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

/*
NOT USED	
app.post('/addFrame', function(req, res){
	var coll = "projects";
	var reply;
	var project;
	var sensorFrame;
	console.log("adding frame to"+req.body.projectID+">>"+req.body.sensorID);
	console.log(req.body);
	mongodb.collection(coll).findOne({'projectID': req.body.projectID }, function( err, result) {
		if (err) throw err;
		project = result;
		var myquery = {'projectID' : project.projectID};
		sensorFrame = createFrameInstance(req, uuidv4());
		var mySensor = project.sensors.findIndex(
			function(sense){
				return sense.sensorID === req.body.sensorID
			});
		var myObj = {};
		myObj["sensors."+mySensor+".sensorFrames"] = sensorFrame;
		var newvalues = {$push: myObj};
		mongodb.collection(coll).updateOne(myquery, newvalues, function(err, result) {
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
				"description": req.body.description,
				"frameID": sensorFrame.frameID 
			};
			projectHelper.updateProjectDate(req.body.projectID);
			res.send(reply);
		})
	});
})
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
		})
	})
});

/*
-------------------------------GET--------------------------
*/

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

/*
NOT USED
app.get('/numberOfFrames?',function(req,res){
	var coll = "projects";
	var projectID = req.query.projectID ? req.query.projectID : 'No Project ID';
	var sensorID = req.query.sensorID ? req.query.sensorID : 'No Sensor ID';
	console.log("Sensor details requested");
	console.log(projectID);
	mongodb.collection(coll).findOne({'projectID': projectID}, function(err, result){
		if (err) throw err;
		var response = [];
		var sensorIndex = result.sensors.findIndex(
			function(sense) {
				return sense.sensorID === sensorID
			}
		)
		console.log(sensorIndex);
		for (var i = 0; i < result.sensors[sensorIndex].sensorFrames.length; i++) {
			response[i] = {
				'frameName': result.sensors[sensorIndex].sensorFrames[i].frameName,
				'users': result.sensors[sensorIndex].sensorFrames[i].users,
				'frameID': result.sensors[sensorIndex].sensorFrames[i].frameID
				
			}
		}
		if (projectHelper.itemInArray(
					authenticaton.getUser(req), 
					result.sensors[sensorIndex].users) >= 0){
			console.log(response.length);
			res.send(response.length);
		}else{
			res.send({'error' : "unauthorized"});
		}
		
		console.log("Frame details sent");
	})
})
*/
			
/*
NOT USED			
app.get('/frame?',function(req,res){
	var coll = "projects";
	var projectID = req.query.projectID ? req.query.projectID : 'No Project ID';
	var sensorID = req.query.sensorID ? req.query.sensorID : 'No Sensor ID';
	var frameID = req.query.frameID ? req.query.frameID : 'No frame ID';
	console.log("Sensor details requested");
	console.log(projectID);

	if (authenticaton.getPermission(req).read == 'true'){	
		mongodb.collection(coll).findOne({'projectID': projectID}, function(err, result){
			if (err) throw err;
			var response = 0;
			var sensorIndex = result.sensors.findIndex(
				function(sense) {
					return sense.sensorID === sensorID
				}
			)
			var frameIndex = result.sensors[sensorIndex].sensorFrames.findIndex(
				function(sensFrame) {
					return sensFrame.frameID === frameID
				}
			)
			response = result.sensors[sensorIndex].sensorFrames[frameIndex]
			if (projectHelper.itemInArray(
							authenticaton.getUser(req), 
							result.sensors[sensorIndex].sensorFrames[frameIndex].users) >= 0){
				res.send(response);
				console.log("Bounding Boxes sent");
			}else{
				res.send({'error' : "unauthorized"});
			}
		})
	}else {
		res.send({'error' : "unauthorized"});
	}
})
*/


/*
---------------------------------------PUT----------------------------------
*/			
	
//TODO:
/*
app.put('/frame',function(req,res){
	var coll = "projects";
	console.log('Updating frame: ' + req.body.frameID);
	mongodb.collection(coll).findOne({'projectID': req.body.projectID}, function(err, result){
		var sensorIndex = result.sensors.findIndex(
			function(sense) {
				return sense.sensorID === req.body.sensorID
			}
		)
		console.log(result.sensors[sensorIndex]);
		var frameIndex = result.sensors[sensorIndex].sensorFrames.findIndex(
			function(sensFrame) {
				return sensFrame.frameID === req.body.frameID
			}
		)
		for (var i = 0; i < result.sensors[sensorIndex].sensorFrames[frameIndex].users.length; i++){
			if (result.sensors[sensorIndex].sensorFrames[frameIndex].users[i] == req.body.username){
				if (authenticaton.getPermission(req).write == 'true') {
					var myObj = {};
					myObj["sensors."+sensorIndex+".sensorFrames."+frameIndex] = {
						'frameID': req.body.frameID,
						'frameName': req.body.frameName,
						'description': req.body.description,
						'users' : req.body.users,
						'translation': {
							"x":     req.body.translation.x,
							"y":     req.body.translation.y,
							"z":     req.body.translation.z,
							"alpha": req.body.translation.alpha,
							"beta":  req.body.translation.beta,
							"gama":  req.body.translation.gama,
							"time":  req.body.translation.time
						}
					}
					
					myObj["sensors."+sensorIndex+".sensorFrames."+frameIndex] = createFrameInstance(req, req.body.frameID)
					var myQuery = {
						"projectID": req.body.projectID
					}
					var newValues = {$set: myObj}
					
					if (projectHelper.itemInArray(
						authenticaton.getUser(req), 
						result.sensors[sensorIndex].sensorFrames[frameIndex].users) >= 0){
							
						mongodb.collection(coll).update(myQuery,newValues, function(err, result) {
							if (err) throw err;
							console.log(result);
							projectHelper.updateProjectDate(req.body.projectID);
							res.send(result);
						})	
							
							
					} else {
						res.send({'error' : "unauthorized"});
					}
					
					
					return;
				}
			} else {
				res.send({'error' : "unauthorized"});
			}
		}
		console.log("access denied");
		res.send({'error':'access denied'});
		
	})
	
})

*/

module.exports = router;