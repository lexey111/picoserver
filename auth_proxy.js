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
		if (config.verbose && !config.quiet) {
			console.log('\tForward request %s, method [%s] to ' + config.neo_addr + '%s', req.url, req.method, req.url.yellow);
		}

		var allowed_host = req.headers.origin;
		var options = {
			url: config.neo_addr + req.url,
			method: req.method,

			headers: {
				'Accept': 'application/vnd.twinfield+json;version=latest',
				'Access-Control-Allow-Origin': '*',
				"Access-Control-Allow-Headers": 'X-Requested-With, ETag, Accept, Origin, Referer, User-Agent, Content-Type, Authorization',
				'Access-Control-Allow-Methods': "PUT, GET, POST, DELETE, OPTIONS",
				'Cookie': auth_cookie
			}

		}

		req.pipe(request(options, function(error, response, body) {
			var s = body ? body.toString() : '';

			s = replaceAll(config.neo_addr, config.mixed_proxy_addr, s); // API url's are hardcoded in the links, so replace them
			if (config.start_for_remote_access) {
				s = replaceAll('http://localhost:3000/api', 'http://' + config.local_server_ip + ':3000/api', s); // API url's are hardcoded in the links, so replace them
			}
			if (error) {
				console.log(error);
				next();
			}

			if (config.verbose && response && response.statusCode && response.statusCode !== 200) {
				console.log('\tStatus', response && response.statusCode ? response.statusCode : 'bad (empty) response');
			}

			res.header('Access-Control-Allow-Origin', allowed_host);
			res.header('Access-Control-Allow-Credentials', 'true');
			res.header("Access-Control-Allow-Headers", "X-Requested-With, ETag, Accept, Origin, Referer, User-Agent, Content-Type, Authorization");
			res.header("Access-Control-Allow-Methods", "PUT, GET, POST, DELETE, OPTIONS");
			res.header('Content-Type', 'application/vnd.twinfield+json');

			if (response.statusCode == 401) {
				printAuthError();
				return res.send(response.statusCode, s);
			}

			if (s) {
				res.send(response.statusCode, s);
			} else {
				console.log('Empty response'.red.bold);
				return res.status(204).send();
			}
		}));
	};
};

function printAuthError() {
	console.log('  +-----------------------+'.red);
	console.log('  |  Authorization error  |'.red.bold);
	console.log('  +-----------------------+'.red);
	console.log('');
	console.log('  Please check the content of auth_cookie.dat file and actualize it according to current login cookie.'.white.bold);
	console.log('  To do this, you need:\n'.white.bold);
	console.log('    1. Open link ' + 'http://localhost:8180/UI/#/Sales/Articles'.yellow + ' (or any other NEO URL according to your local settings) in your browser.');
	console.log('    2. Login to Twinfield if it required.');
	console.log('    3. Open Developer tool (' + 'F12'.yellow + ' in Chrome browser).');
	console.log('    4. Switch to Network tab and refresh the page if no request has been recorded.');
	console.log('    5. Find the GET request to ' + 'API/'.magenta.bold + ', it has to have response code 200 (if not - you need to login).');
	console.log('    6. Open the request headers tab.');
	console.log('    7. Copy all the content of Cookie starting from "' + 'UserToken=...'.yellow + '" to clipboard.');
	console.log('    8. Open file ' + 'auth_cookie.dat'.yellow + ' in the current folder anf replace its content by clipboard. Save it.');
	console.log('    9. Start ' + 'Run.bat'.green.bold + ' again.');
	console.log('    10. Now you can to remove ' + 'UI'.yellow + ' folder/app in IIS configuration for Twinfield');
	console.log('');
}

module.exports = function(stat_object) {
	stat = stat_object;
	return proxy;
};