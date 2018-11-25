//libs
//const uuidv4 = require('uuid/v4');
var express = require('express');
var MongoClient = require('mongodb').MongoClient;
const bodyParser = require("body-parser");

const passport = require('passport');
const session = require('express-session');
const RedisStore = require('connect-redis')(session)


//server config
var app = express();

app.use(session({
  store: new RedisStore({
    url: process.env.REDIS_STORE_URI
  }),
  secret: process.env.REDIS_STORE_SECRET,
  resave: false,
  saveUninitialized: false
}))
app.use(passport.initialize());
app.use(passport.session());

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

//MongoDB
var mongodb;
var mongoDBurl = "mongodb://localhost:27017/";
MongoClient.connect(mongoDBurl, {poolsize: 10}, function(err,db){
//	assert.equal(null,err);
	mongodb=db.db("mydb");

	
	var appDataResource = require('./appData');
	var authenticationResource = require('./authentication');

	appDataResource(app, MongoClient, mongoDBurl, mongodb).configureRoutes();
	authenticationResource(app, mongodb).configureRoutes();
	
})


var server = app.listen(8081, function () {

   var host = server.address().address
   var port = server.address().port

   console.log("Example app listening at http://%s:%s", host, port)
})

