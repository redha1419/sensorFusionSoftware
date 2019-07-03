Running Database server on Windows:

1) downaload and install Mongo DB from https://www.mongodb.com/download-center?jmp=nav#community

2) In windows Service Manager ensure MongoDB is running

3) navigate to C:\Program Files\MongoDB\Server\3.6\bin and run mongo.exe
   a) type 'use mydb' in the console

4) download and install node.js 8.11.3 https://nodejs.org/en/

5) clone JS script from https://github.com/PG188/sensorFusionSoftware

6) using console navigate to cloned directory and run 'node index'