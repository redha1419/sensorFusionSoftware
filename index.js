require('dotenv').config();
const express = require('express');
const bodyParser = require("body-parser");
const passport = require('passport');
const bcrypt = require('bcryptjs')
const knex = require('./server/db/knex')
const uuidv4  = require('uuid/v4');
//server config
const app = express();
const logResponseTime = require("./server/response-time-logger");


//for measuring times
app.use(logResponseTime);

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
const projectRoutes = require('./server/routes/project');
const sensorRoutes = require('./server/routes/sensor');
const frameRoutes = require('./server/routes/frame');
const boundingBoxRoutes = require('./server/routes/boundingBox');
const labelRoutes = require('./server/routes/label');
const userRoutes = require('./server/authentication');
const middleWare = require('./server/routes/middleware/auth-check.js');


//base route
app.get('/', function(req, res) 
{
	res.writeHead(200, {'Content-Type': 'text/html'});
	res.end('I am the backend. This is a secure server. There are no web pages.');
});

//additional routes
app.use('/', middleWare);
app.use('/', projectRoutes);
app.use('/', userRoutes);
app.use('/', sensorRoutes);
app.use('/', frameRoutes);
app.use('/', boundingBoxRoutes);
app.use('/', labelRoutes);

//hosting server
const server = app.listen(process.env.PORT, function () {

   const host = server.address().address
   const port = server.address().port

   console.log("Example app listening at http://%s:%s", host, port)
})


knex('users')
.then(users=>{
  if(users.length == 0){
    //create a user
    const user = {
      'user_id': uuidv4(),
      'username': 'ahmed',
      'password_hash': bcrypt.hashSync('000', 10),
      'user_role': 'administrator'
    };
    knex('users')
    .insert(user)
    .then(user=>{
      console.log('made a user')
    })
  }
  else{
    console.log('users already exist')
  }
})