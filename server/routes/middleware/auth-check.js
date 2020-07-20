const knex = require('../../db/knex');
const jwt = require('jsonwebtoken');
require('dotenv').config();
let fs = require('fs');
const publicKey  = fs.readFileSync('./server/authentication/public.key', 'utf8');

//this is a middleweare function meant to go into an express handler
// it looks like it returns 401 if the user is not verified or else passes to next()


function parseCookies (request) {
    var list = {},
        rc = request.headers.cookie;

    rc && rc.split(';').forEach(function( cookie ) {
        var parts = cookie.split('=');
        list[parts.shift().trim()] = decodeURI(parts.join('='));
    });

    return list;
}

function checkCookie(req){
	var cookieList = parseCookies(req);
	let options = {
		"algorithm": "RS256",
		"expiresIn": "2h",
		"issuer": "ETF Lab"
    };
    var payload;
    try{
        payload = jwt.verify(cookieList.token,publicKey,options);
    }
    catch(err){
        return null
    }
	
	return payload;
}


module.exports = (req, res, next) => {
    if (req.originalUrl === '/login') {
        return next();
    }
    //For now all we will do is make sure that the user can acess the project in question (EXCEPTION: /listProjects)
    decoded = checkCookie(req); //should be decoded.username and decoded.user_role

    if(decoded == null || decoded == undefined || (Object.entries(decoded).length === 0 && decoded.constructor === Object)){
        return res.status(401).json({"error": "an error occured during authentication"});
    }
    if(decoded.user_role.toLowerCase() != "administrator"){ //if not admin, check to see if in project in question
        knex('users_projects')
        .where('user_id', knex('users').where('username', decoded.username ).select('user_id'))
        .where('project_id', req.body.project)
        .then(project => {
            if(project){
                next()
            }
            else {
                return res.status(401).json({"error": "an error occured during authentication"});
            }
        })
        .catch(err => {
            return res.status(401).json(err);
        })
    }
    else {
        console.log("passed along!")
        next()
    }
};
