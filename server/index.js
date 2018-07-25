//libs
//const uuidv4 = require('uuid/v4');
var express = require('express');
var MongoClient = require('mongodb').MongoClient;
const bodyParser = require("body-parser");

//MongoDB
var mongoDBurl = "mongodb://localhost:27017/";

//server config
var app = express();
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

var appDataResource = require('./appData');

appDataResource(app, MongoClient, mongoDBurl).configureRoutes();

var server = app.listen(8081, function () {

   var host = server.address().address
   var port = server.address().port

   console.log("Example app listening at http://%s:%s", host, port)
})

