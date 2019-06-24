

int findBoundingBoxIndex(boundingBoxArray, boundingBoxID){
	return boundingBoxArray.findIndex(
		function(boundingBox){
			return boundingBox.boundingBoxID === boundingBoxID
		});
}