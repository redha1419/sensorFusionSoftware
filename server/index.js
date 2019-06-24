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

//passport configs
app.use(passport.initialize());
app.use(passport.session());

//body-parser configs
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

//header configs for unkown ips 
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

//project routes
const projectRoutes = require('./routes/project');

//base route
app.get('/', function(req, res) 
{
	res.writeHead(200, {'Content-Type': 'text/html'});
	res.end('I am the backend. This is a secure server. There are no web pages.');
});

//additional routes
app.use('/api/', projectRoutes);

//hosting server
const server = app.listen(process.env.PORT, function () {

   const host = server.address().address
   const port = server.address().port

   console.log("Example app listening at http://%s:%s", host, port)
})

