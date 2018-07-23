var express = require('express');
var app = express();

const bodyParser = require("body-parser");

var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

app.post('/newProject', function (req, res) {
   console.log("creating new project:"+req.body.ProjectName);
	var coll = "projects";
	MongoClient.connect(url, function(err, db) {						//Establish mongo Connection
	  if (err) throw err;
	  var dbo = db.db("mydb");
	  var myobj = req.body;
	  dbo.createCollection(coll, function(err, res) {			//create projects Collection if non exists
		if (err) throw err;
		db.close();
	  });
	  dbo.collection(coll).insertOne(myobj, function(err, res) {	//Create Project Document
		if (err) throw err;
		console.log("Project Document Created");
		db.close();
	  });
	});
   res.send({
	   "status": 0,
	   "url": url,
	   "collection": coll,
	   "ProjectName": req.body.ProjectName,
	   "Result": res
   });   
})

app.post('/addSensor', function (req, res) {
   console.log("adding sensor"+req.body.sensorName);
	var coll = "projects";
	MongoClient.connect(url, function(err, db) {						//Establish mongo Connection
	  if (err) throw err;
	  var dbo = db.db("mydb");
	  var myquery = { ProjectName: "Test" };
	  var newvalues = { $set: {Sensors: "defined", Operations: "1" } };	  
	  dbo.collection(coll).updateOne(myquery, newvalues, function(err, res) {	//Create Project Document
		if (err) throw err;
		console.log("Project Document Created");
		db.close();
	  });
	});
   res.send({
	   "status": 0,
	   "url": url,
	   "collection": coll,
//	   "ProjectName": req.body.ProjectName
   });
})

