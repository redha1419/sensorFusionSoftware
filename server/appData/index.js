"use strict";

module.exports = (app, MongoClient, mongoDBurl) => {
	return {
		"configureRoutes": () => {
			var projectResource = require('./project');
			var sensorResource = require('./sensor');
			var frameResource = require('./frame');
			var boundingBoxResource = require('./boundingBox');

			projectResource(app, MongoClient, mongoDBurl).configureRoutes();
			sensorResource(app, MongoClient, mongoDBurl).configureRoutes();
			frameResource(app, MongoClient, mongoDBurl).configureRoutes();
			boundingBoxResource(app, MongoClient, mongoDBurl).configureRoutes();
		}

	};
}