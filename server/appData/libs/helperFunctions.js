"use strict";

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
			
			
		}
		
		
		
	};
};

/*
exports.updateProjectDate = function() {
	console.log('funciton called');
	return 0;
}	
*/
