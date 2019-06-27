"use strict";
const moment =  require('moment')

function getAllUsersRecursive(item, list) {
	var levels = ["sensors", "sensorFrames", "boundingBoxes"];
	if (list == undefined){
		list = [];
	}
	if (item == undefined){
		return list;
	}

	if (item.users != undefined ){
		list = list.concat(item.users);
	}
	for (var level = 0; level < levels.length; level++){
		if (item[levels[level]] != undefined){
			for (var itemID = 0; itemID < item[levels[level]].length; itemID++){
				list = getAllUsersRecursive(item[levels[level]][itemID], list);
			}
		}
	}
	var result = list.filter(function(item, pos) {
		return list.indexOf(item) == pos;
	})
	
	return result;
}

module.exports = function(knex) {
	return{
		
		updateProjectDate: function(projectID) {
			const date_stamp = moment().format();
			console.log('Updating Project: ' + projectID);
			const newValues = { "date_modified": date_stamp };
			const myQuery = { "project_id": projectID };
			knex('projects')
			.update(newValues)
			.where(myQuery)
			.then(()=>{
				return 0;
			})
			.catch(err=>{
				console.log('failed to update project date modifified, most likely did not give valid projectID');
			})	
		},
		
		/*
		NOT USED
		checkUser: function(username, userpassword){
			mongodb.collection('users').findOne({'username': username}, function(err, result) {
				if (err) throw err;
				if (result != null){
					if (result.password == userpassword) {
						return true;
					}
				}
				return false;
			});
		},
		*/
		
		itemInArray: function(item, array) {
			var i;
			if ( (array != undefined) && (array.constructor === Array) ) {
				for(i = 0; i < array.length; i++){
					if (item == array[i]){
						return i;
					}
				}
			}
			return -1;
		},
		
		getAllUsers: function(item) {
			return getAllUsersRecursive(item);				
		}

	};
};
