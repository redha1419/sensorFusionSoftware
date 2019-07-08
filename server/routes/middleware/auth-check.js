import knex from '../db/knex';
const jwt = require('jsonwebtoken');
require('dotenv').config();


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
		"expiresIn": "10h",
		"issuer": "ETF Lab"
	};
	var payload = jwt.verify(cookieList.token,publicKey,options);
	return payload;
}


module.exports = (req, res, next) => {
    //TODO: add jwt authentication with cookies
    //For now all we will do is make sure that the user can acess the project
    decoded = checkCookie(req);

    console.log(list)
    knex('users_projects')
    .where('user_id', decoded.username )
    .where('project_id', req.body.project)
};
