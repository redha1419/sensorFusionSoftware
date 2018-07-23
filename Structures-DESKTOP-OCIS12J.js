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
				"SensorID": "",
				"SensorReference": "",
				"Name": "",
				"Frame": [
				{
					"FrameID": "",
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
					"BoundingBox": [
						{
							"BoundingBoxID": "",
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


//-----http://127.0.0.1:8081/newProject------------
//POST
{
	"ProjectName": "",
	"Users": [{"UserID": "", "Pemission": ""}],
	"sensors": [],
	"operations": [],
	"superframe": {}
}

//Response
{
	"Status" :"",
	"url": "",
	"collection": "",
	"ProjectID":""
}

//-----http://127.0.0.1:8081/addSensor------------
//POST
{
	"sensorReference": "",
	"sensorName": ""
}
//Response
{
	"Status" :"",
	"SensorID":"",
	"SensorName":""
}

//-----http://127.0.0.1:8081/addFrame------------
//POST
{
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
	"FrameID": "",
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
//Response
{
	"Status" :"",
	"BoundingBoxID":"",
	"SensorName":""
}