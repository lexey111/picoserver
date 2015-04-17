'use strict';

// Statistic
var counters = {
	total: 0,
	api: 0
};

var config = require('./config');
var express = require('express');
var app = express();
var compression = require('compression');
var auth_proxy = require('./auth_proxy.js')(counters); 
var path = require('path');
var colors = require('colors');
module.exports = app;


/**
 * Main middleware
 */
var middleHandler = function(req, res, next) {
	counters.total++;

	if (config.verbose) {
		console.log('URL requested: ', req.url);
	} else {
		process.stdout.write('\u001b[0G');
		process.stdout.write('Processed requests:'.magenta.bold + ' [' + counters.total + '] API: [' + counters.api + ']...');
	}
	/*
	// Example of process-on-the-fly
	var s,
		lang = 'en';
	//lang = req.session.lang || 'en';

	s = req.url;

	s = s.replace(/(.+)\/(fonts\/.+)$/gi, '/UI/bundles/$2'); // *fonts/font.ext -> public/bundles/fonts/font.ext
	s = s.replace(/(.+)\/(images\/.+)$/gi, '/UI/bundles/$2'); // images

	if (s == '/UI/') {
		s = '/UI/Index.cshtml';
	}

	if (/cshtml/i.test(s)) {
		console.log('\tCSHTML request: ', path.basename(s));
		res.set('Content-Type', 'text/html');
	}

	req.url = s;
	console.log('\tURL translated: ', req.url);
	*/
	next();
}


app.use(auth_proxy(/\/api\/(.*)/i));
app.use(compression());
app.use(middleHandler);
app.use(express.static(path.resolve(config.resources)));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
	console.log('Error 404');
	res.status(404);
	return res.send('File not found');
});

app.use(function(err, req, res, next) {
	console.log('Error 500');
	console.log(err);
	res.status(err.status || 500);
	return res.send('Internal error');
});

console.log('');
console.log('Twinfield PicoServer for StaticAssets'.green.bold);
console.log('-------------------------------------'.gray);
console.log('Server is listening on port', process.env.PORT || config.port);
console.log('Resources path set as', path.resolve(config.resources));
console.log('');
process.stdout.write('Ready...'.cyan.bold);

app.listen(process.env.PORT || config.port);