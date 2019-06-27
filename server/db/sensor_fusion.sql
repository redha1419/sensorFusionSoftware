CREATE SCHEMA sensor_fusion;

CREATE TABLE sensor_fusion.projects ( 
	id                   bigint  NOT NULL GENERATED BY DEFAULT AS IDENTITY,
	name                 text   ,
	date_created         timestamp DEFAULT current_timestamp  ,
	date_modified        timestamp DEFAULT current_timestamp  ,
	description          text   ,
	project_id           text   ,
	CONSTRAINT pk_projects_id PRIMARY KEY ( id ),
	CONSTRAINT unq_projects_project_id UNIQUE ( project_id ) 
 );

CREATE TABLE sensor_fusion.sensors ( 
	project_id           text  NOT NULL ,
	sensor_id            text   ,
	sensor_type          text   ,
	sensor_name          text   ,
	id                   bigint  NOT NULL GENERATED BY DEFAULT AS IDENTITY,
	CONSTRAINT pk_sensors_id PRIMARY KEY ( id ),
	CONSTRAINT unq_sensors_sensor_id UNIQUE ( sensor_id ) ,
	CONSTRAINT fk_sensors_projects FOREIGN KEY ( project_id ) REFERENCES sensor_fusion.projects( project_id ) ON DELETE CASCADE 
 );

CREATE TABLE sensor_fusion.users ( 
	user_id              text  NOT NULL ,
	id                   integer  NOT NULL GENERATED BY DEFAULT AS IDENTITY,
	username             varchar(100)   ,
	password_hash        text   ,
	user_role            text   ,
	CONSTRAINT pk_users_id PRIMARY KEY ( id ),
	CONSTRAINT idx_users UNIQUE ( username ) 
 );

CREATE TABLE sensor_fusion.frames ( 
	id                   bigint  NOT NULL GENERATED BY DEFAULT AS IDENTITY,
	sensor_id            text   ,
	frame_id             text   ,
	description          text   ,
	translation_data     json   ,
	frame_name           text   ,
	CONSTRAINT pk_frames_id PRIMARY KEY ( id ),
	CONSTRAINT unq_frames_frame_id UNIQUE ( frame_id ) ,
	CONSTRAINT fk_frames_sensors FOREIGN KEY ( sensor_id ) REFERENCES sensor_fusion.sensors( sensor_id ) ON DELETE CASCADE 
 );

CREATE TABLE sensor_fusion.bounding_boxes ( 
	id                   bigint  NOT NULL GENERATED BY DEFAULT AS IDENTITY,
	global_index         integer   ,
	shape                integer   ,
	temporal_attribute   text   ,
	confidence           integer   ,
	description          text   ,
	points               json   ,
	frame_id             text  NOT NULL ,
	label                text   ,
	bounding_box_id      text   ,
	"parameters"         json   ,
	CONSTRAINT pk_bounding_boxes_id PRIMARY KEY ( id ),
	CONSTRAINT fk_bounding_boxes_frames FOREIGN KEY ( frame_id ) REFERENCES sensor_fusion.frames( frame_id ) ON DELETE CASCADE 
 );
