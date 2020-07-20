Running server on Linux/Mac OS:

1. Install node (https://nodejs.org/en/)

   MAC OS: `curl "https://nodejs.org/dist/latest/node-${VERSION:-$(wget -qO- https://nodejs.org/dist/latest/ | sed -nE 's|.*>node-(.*)\.pkg</a>.*|\1|p')}.pkg" > "$HOME/Downloads/node-latest.pkg" && sudo installer -store -pkg "$HOME/Downloads/node-latest.pkg" -target "/"`

   Linux (Cent OS): `sudo yum install epel-release; sudo yum install nodejs`


2. Clone or fork the sensorFusionSensor repository (https://github.com/redha1419/sensorFusionSoftware)

   `git clone https://github.com/redha1419/sensorFusionSoftware`

3. Install dependencies

   `cd sensorFusionSoftware; npm install`

4. Install Postgres (version 10)

   MAC OS: `brew install postgres@10; pg_ctl -D /usr/local/var/postgres start; initdb /usr/local/var/postgres;`

   Linux: `sudo yum install postgresql-server postgresql-contrib; sudo postgresql-setup initdb; sudo systemctl start postgresql; sudo systemctl enable postgresql;`

5. Create database and setup schema

   First enter posrgres cli: `psql postgres`
   Create database:          `create database label_tool;`
   Setup schema:             `cd server/db/; ./sensor_fusion.sql`

6. Setup environment and database

   open `.env` file in the root of the repository

   set port to the port the service will run on: `PORT=3000`

   set database config (set accordingly, this is a sample):

      DATABASE_PORT=5432
      DATABASE_HOST=localhost
      DATABASE_NAME=label_tool
      DATABASE_SCHEMA=sensor_fusion
      DATABASE_USER=reza
      DATABASE_PASSWORD=password