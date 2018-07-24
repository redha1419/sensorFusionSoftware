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
{
	"projectID":"",
	"sensorID": "",
	"FrameID": "",
	"shape": "",
	"confidence": "",
	"BB1": {
		"x1": "",
		"y1": "",
		"x2": "",
		"y2": "",
	},
}
//Response
{
	"Status" :"",
	"BoundingBoxID":"",
	"SensorName":""
}