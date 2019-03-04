"use strict";

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
			console.log(item[levels[level]]);
			for (var itemID = 0; itemID < item[levels[level]].length; itemID++){
				list = getAllUsersRecursive(item[levels[level]][itemID], list);
			}
		}
	}
	var result = list.filter(function(item, pos) {
		return list.indexOf(item) == pos;
	})
	
	console.log(result);
	return result;
}

module.exports = function(mongodb) {
	return{
		updateProjectDate: function(projectID) {
			var date_stamp = new Date();
			//console.log("update date" + date_stamp.toString());
			var coll = "projects";
			
			console.log('Updating Project: ' + projectID);
			var newValues = {$set: {
				"dateModified": date_stamp.toString()
			} };
			var myQuery = {
				"projectID": projectID
			}
			mongodb.collection(coll).update(myQuery,newValues, function(err, result) {
				if (err) throw err;
			})			
			return 0;
		},
		
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

/*
exports.updateProjectDate = function() {
	console.log('funciton called');
	return 0;
}	
*/
