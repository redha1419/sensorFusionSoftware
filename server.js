const uuidv4 = require('uuid/v4');

var express = require('express');
var app = express();

const bodyParser = require("body-parser");

var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());


/************************************************
Post Commands
*************************************************
*/

app.post('/addProject', function (req, res) {
	console.log("creating new project:"+req.body.projectName);
	var coll = "projects";
	var reply;
	MongoClient.connect(url, function(err, db) {						//Establish mongo Connection
	  if (err) throw err;
	  var dbo = db.db("mydb");
	  var myobj = {
		"projectID": uuidv4(),
		"projectName": req.body.projectName,
		"Users": [],
		"sensors": [],
		"operations": [],
		"superframe": {}		  
	  };
	  dbo.createCollection(coll, function(err, res) {			//create projects Collection if non exists
		if (err) throw err;
		db.close();
	  });
	  dbo.collection(coll).insertOne(myobj, function(err, result) {	//Create Project Document
		if (err) throw err;
		console.log("Project Document Created");		
		reply = {
		   "insertedCount": result.insertedCount,
		   "url": url,
		   "collection": coll,
		   "projectName": result.ops[0].projectName,
		   "projectID": result.ops[0].projectID,
		   "_ID": result.ops[0]._id
		};
		res.send(reply);
		db.close();
	  });
	});
})

app.post('/addSensor', function(req, res){
	var coll = "projects";
	var reply;
	var project;
   console.log("adding sensor to"+req.body.projectID);
   MongoClient.connect(url, function(err, db) {
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
			   "url": url,
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
app.post('/addFrame', function(req, res){
	var coll = "projects";
	var reply;
	var project;
	var sensorFrame;
   console.log("adding frame to"+req.body.projectID+">>"+req.body.sensorID);
   console.log(req.body);
   MongoClient.connect(url, function(err, db) {
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
			   "url": url,
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


app.post('/addBoundingBox', function(req,res){
	var coll = "projects";
	var reply;
	var project;
	var sensorFrame;
	console.log("adding frame to" + 
				req.body.projectID + 
				" >> "+ req.body.sensorID + 
				" >> "+ req.body.frameID);
	MongoClient.connect(url, function(err, db) {
		if (err) throw err;
		var dbo = db.db("mydb");
		var boundingBox = {
			"boundingBoxID": uuidv4(),
			"shape": req.body.shape,
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
			var mySensor = project.sensors.findIndex(
				function(sense){
					return sense.sensorID === req.body.sensorID
				});
			console.log(project.sensors[mySensor].sensorFrame);
			var myFrame = project.sensors[mySensor].sensorFrame.findIndex(
				function(theFrame){
					return theFrame.frameID === req.body.frameID
				});
			var myObj = {};
			myObj["sensors."+mySensor+".sensorFrame."+myFrame+".boundingBox"] = boundingBox;
			var newValues = {$push: myObj};
			var myQuery = {'projectID' : project.projectID};
			dbo.collection(coll).updateOne(myQuery, newValues, function(err, result) {
				if (err) throw err;
				console.log("Bounding Box Saved");
				console.log(project.sensors[mySensor].sensorFrame[myFrame]);
				res.send(project.sensors[mySensor].sensorFrame[myFrame]);
				db.close				
			})
		})
	})
})

/************************************************
Get Commands
*************************************************
*/
app.get('/listProjects', function(req,res){
	var coll = "projects";
	var reply;
	var project;
	console.log("Project list requested");
	MongoClient.connect(url, function(err,db){
		if (err) throw err;
		var dbo = db.db("mydb");
		dbo.collection(coll).find({}).toArray(function(err, result){
			if (err) throw err;
			var reply = [{}];
			for (var i = 0; i < result.length; i++) {
				reply[i] = {
					'projectName': result[i].projectName,
					'projectID': result[i].projectID
				}
			}
			console.log(reply);
			res.send(reply);
			console.log("Project list sent");
			db.close			
		})
	
	})
	
})

app.get('/project?', function(req,res){
	var coll = "projects";
	var projectID = req.query.projectID ? req.query.projectID : 'No Project ID';
	console.log("Project details requested");
	console.log(projectID);
	MongoClient.connect(url, function(err,db){
		if (err) throw err;
		var dbo = db.db("mydb");
		dbo.collection(coll).findOne({'projectID': projectID}, function(err, result){
			if (err) throw err;
			console.log(result);
			res.send(result);
			console.log("Project details sent");
			db.close			
		})
	})
})
app.get('/listSensors?', function(req,res){
	var coll = "projects";
	var projectID = req.query.projectID ? req.query.projectID : 'No Project ID';
	console.log("Sensor details requested in project " + projectID);
	console.log(projectID);
	MongoClient.connect(url, function(err,db){
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
	MongoClient.connect(url, function(err,db){
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

app.get('/boundingBoxes?', function(req,res){
	var coll = "projects";
	var projectID = req.query.projectID ? req.query.projectID : 'No Project ID';
	var sensorID = req.query.sensorID ? req.query.sensorID : 'No sensor ID';
	var frameID = req.query.frameID ? req.query.frameID : 'No Frame ID';
	console.log("Software details requested");
	console.log(projectID);
	MongoClient.connect(url, function(err,db){
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


/************************************************
Put Commands
*************************************************
*/
app.put('/boundingBox', function(req,res){
	var coll = "projects";
	console.log("Editing boundinBoxID: " + req.body.boundingBoxID );
	MongoClient.connect(url, function(err,db){
		if (err) throw err;
		var dbo = db.db("mydb");
		dbo.collection(coll).findOne({'projectID': req.body.projectID}, function(err, result){
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



// This responds with "Hello World" on the homepage
app.get('/', function (req, res) {
   console.log("Got a GET request for the homepage");
   res.send('Hello GET');
})

// This responds a POST request for the homepage
app.post('/', function (req, res) {
   console.log("Got a POST request for the homepage");
   res.send('Hello POST' + JSON.stringify(req.body));
})

// This responds a DELETE request for the /del_user page.
app.delete('/del_user', function (req, res) {
   console.log("Got a DELETE request for /del_user");
   res.send('Hello DELETE');
})

// This responds a GET request for the /list_user page.
app.get('/list_user', function (req, res) {
   console.log("Got a GET request for /list_user");
   res.send('Page Listing');
})

// This responds a GET request for abcd, abxcd, ab123cd, and so on
app.get('/ab*cd', function(req, res) {   
   console.log("Got a GET request for /ab*cd");
   res.send('Page Pattern Match');
})

var server = app.listen(8081, function () {

   var host = server.address().address
   var port = server.address().port

   console.log("Example app listening at http://%s:%s", host, port)
})

