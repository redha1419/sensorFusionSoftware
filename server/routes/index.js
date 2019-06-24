"use strict";

module.exports = (app, MongoClient, mongoDBurl, mongodb) => {
	return {
		"configureRoutes": () => {
			var projectResource = require('./project');
			var sensorResource = require('./sensor');
			var frameResource = require('./frame');
			var boundingBoxResource = require('./boundingBox');
			var pointsResource = require('./points');

			projectResource(app, MongoClient, mongoDBurl, mongodb).configureRoutes();
			sensorResource(app, MongoClient, mongoDBurl, mongodb).configureRoutes();
			frameResource(app, MongoClient, mongoDBurl, mongodb).configureRoutes();
			boundingBoxResource(app, MongoClient, mongoDBurl, mongodb).configureRoutes();
			pointsResource(app, MongoClient, mongoDBurl, mongodb).configureRoutes();
		}

	};
}