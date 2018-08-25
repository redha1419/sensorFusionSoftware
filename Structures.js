//---------------------Project----------------------------------------
{
	"ID": "",
	"ProjectName": "",
	"Users": [
			{"UserID": "", "Pemission": ""},
			{"UserID": "", "Pemission": ""},
			{"UserID": "", "Pemission": ""}
		],
	"sensors": [
			{
				"sensorID": "",
				"sensorReference": "",
				"sensorName": "",
				"sensorFrame": [
				{
					"frameID": "",
					"data_location": "",
					"transation": {
						"x": "",
						"y": "",
						"z": "",
						"alpha": "",
						"beta": "",
						"gama": "",
						"time": ""	
					}
					"boundingBox": [
						{
							"boundingBoxID": "",
							"shape": "",
							"confidence": "",
							"Coordinate1": {
								"x": "",
								"y": "",
								"z": ""
							},
							"Coordinate2": {
								"x": "",
								"y": "",
								"z": ""
							},
							
						}
					]
				}
				]
			},
			{},
			{}

		],
	"operations": [
			{
				"OperationID": "",
				"OperationReference": "",
				"FrameID": [],
				"input": {},
				"Timestamp": ""
			}
		],
	"superframe": {
			"superframe": {},
			"frameID": ""
		}
	
	
}


//-----http://127.0.0.1:8081/addProject------------
//POST
{
	"ProjectName": "",
	"Users": [{"UserID": "", "Pemission": ""}],
}

//Response
{
	"Status" :"",
	"projectID":""
}

//-----http://127.0.0.1:8081/addSensor------------
//POST
{
	"projectID":"",
	"sensorReference": "",
	"sensorName": ""
}
//Response
{
    "url": "",
    "collection": "",
    "projectName": "",
    "projectID": "",
    "sensorName": "",
    "sensorID": ""
}

//-----http://127.0.0.1:8081/addFrame------------
//POST
{
	"projectID":"",
	"sensorID": "",
	"Data_location": "",
	"Transation": {
		"x": "",
		"y": "",
		"z": "",
		"alpha": "",
		"beta": "",
		"gama": "",
		"time": "",	
	}
}
//Response
{
	"Status" :"",
	"FrameID":"",
	"SensorName":""
}


//-----http://127.0.0.1:8081/addBoundingBox------------
//POST Polygon
{
	"projectID":"",
	"sensorID": "",
	"FrameID": "",
	"shape": "1",
	"confidence": "",
	"points": [
		{
			"index":"0",
			"x":"0",
			"y":"0"
		},
		{
			"index":"1",
			"x":"1",
			"y":"1"
		},
		{
			"index":"2",
			"x":"2",
			"y":"0"
		},
		{
			"index":"3",
			"x":"1",
			"y":"0.2"
		}
	]
}
//Response
{
	"Status" :"",
	"BoundingBoxID":"",
	"SensorName":""
}
//POST Rectangle/Square
{
	"projectID":"",
	"sensorID": "",
	"FrameID": "",
	"shape": "2",
	"confidence": "",
	"parameters": {
		"x1": "",
		"y1": "",
		"x2": "",
		"y2": "",
		"theta": ""
	}
}
//Response
{
	"Status" :"",
	"BoundingBoxID":"",
	"SensorName":""
}
//POST Ellipse/Circle
{
	"projectID":"",
	"sensorID": "",
	"FrameID": "",
	"shape": "3",
	"confidence": "",
	"parameters": {
		"x": "",
		"y": "",
		"a": "",
		"b": "",
		"theta": ""
	}
}
//Response
{
	"Status" :"",
	"BoundingBoxID":"",
	"SensorName":""
}
//PUT Polygon
{
	"projectID":"",
	"sensorID": "",
	"frameID": "",
	"boundingBoxID": "",
	"shape": "1",
	"confidence": "",
	"points": [
		{
			"index":"0",
			"x":"0",
			"y":"0"
		},
		{
			"index":"1",
			"x":"1",
			"y":"1"
		},
		{
			"index":"2",
			"x":"2",
			"y":"0"
		},
		{
			"index":"3",
			"x":"1",
			"y":"0.2"
		}
	]
}
//Response
{
	"Status" :"",
	"BoundingBoxID":"",
	"SensorName":""
}
//PUT Rectangle/Square
{
	"projectID":"",
	"sensorID": "",
	"frameID": "",
	"boundingBoxID": "",
	"shape": "2",
	"confidence": "",
	"parameters": {
		"x1": "",
		"y1": "",
		"x2": "",
		"y2": "",
		"theta": ""
	}
}
//Response
{
	"Status" :"",
	"BoundingBoxID":"",
	"SensorName":""
}
//PUT Ellipse/Circle
{
	"projectID":"",
	"sensorID": "",
	"frameID": "",
	"boundingBoxID": "",
	"shape": "3",
	"confidence": "",
	"parameters": {
		"x": "",
		"y": "",
		"a": "",
		"b": "",
		"theta": ""
	}
}
//Response
{
	"Status" :"",
	"BoundingBoxID":"",
	"SensorName":""
}