"use strict";
const moment =  require('moment')

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
		}
		
	};
};
