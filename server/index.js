require('dotenv').config();
const express = require('express');
const bodyParser = require("body-parser");
const passport = require('passport');
//server config
const app = express();




/* //TODO: WHY ARE WE USING REDIS STORE ?
const session = require('express-session');
const RedisStore = require('connect-redis')(session)
app.use(session({
  store: new RedisStore({
    url: process.env.REDIS_STORE_URI
  }),
  secret: process.env.REDIS_STORE_SECRET,
  resave: false,
  saveUninitialized: false
}))
*/

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

