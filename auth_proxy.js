'use strict';

var config = require('./config');
var request = require('request');
var auth_cookie = require('fs').readFileSync('./auth_cookie.dat', "utf8");
var colors = require('colors');

var stat;

/**
 * Wrapper for s = s.replace(/<1>/gi, '<2>');
 */
function replaceAll(find, replace, str) {
	return str.replace(new RegExp(find, 'gi'), replace);
}

/**
 * Main routine
 */
function proxy(pattern) {
	return function(req, res, next) {
		if (!req.url.match(pattern)) {
			return next();
		}

		stat.api++;
		if (config.verbose) {
			console.log('\nForward request %s, method %s \nwill -> ' + config.api_addr + '%s\n', req.url, req.method, req.url);
		} 

		var allowed_host = req.headers.origin;
		var options = {
				url: config.api_addr + req.url,
				method: req.method,

				headers: {
					'Accept': 'application/vnd.twinfield+json',
					'Access-Control-Allow-Origin': '*',
					"Access-Control-Allow-Headers": 'X-Requested-With, ETag, Accept, Origin, Referer, User-Agent, Content-Type, Authorization',
					'Access-Control-Allow-Methods': "PUT, GET, POST, DELETE, OPTIONS",
					'Cookie': auth_cookie
				}

			}
			//console.log(options);
		req.pipe(request(options, function(error, response, body) {
			var
				s = body ? body.toString() : '';

			s = replaceAll(config.api_addr, config.mixed_proxy_addr, s); // API url's are hardcoded in the links, so replace them
			if (error) {
				console.log(error);
				next();
			}

			if (config.verbose) {
				console.log('\tStatus', response && response.statusCode ? response.statusCode : 'bad (empty) response');
			}

			res.header('Access-Control-Allow-Origin', allowed_host);
			res.header('Access-Control-Allow-Credentials', 'true');
			res.header("Access-Control-Allow-Headers", "X-Requested-With, ETag, Accept, Origin, Referer, User-Agent, Content-Type, Authorization");
			res.header("Access-Control-Allow-Methods", "PUT, GET, POST, DELETE, OPTIONS");
			res.header('Content-Type', 'application/vnd.twinfield+json');

			if (response.statusCode == 401){
				console.log('\n');
				console.log('Authorization error'.red.bold);
				console.log('Please check the content of auth_cookie.dat file and actualize it due to current login cookie.'.yellow.bold);
				console.log('\n');
			}

			if (s) {
				res.send(response.statusCode, s);
			} else {
				console.log('Empty response');
				return res.status(204).send();
			}
		}));
	};
};

module.exports = function(stat_object){
	stat = stat_object;
	return proxy;
};