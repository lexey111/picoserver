'use strict';

// Statistic
var counters = {
	total: 0,
	total_size: 0,
	api: 0,
	api_size: 0
};

var config = require('./config');
var express = require('express');
var app = express();
var compression = require('compression');
var auth_proxy = require('./auth_proxy.js')(counters);
var path = require('path');
var colors = require('colors');
var http = require('http');
var fs = require('fs');

function replaceAll(find, replace, str) {
	return str.replace(new RegExp(find, 'gi'), replace);
}

/**
 * Main middleware
 */
var middleHandler = function(req, res, next) {
	counters.total++;

	if (!config.quiet) {
		if (config.verbose) {
			console.log('\tURL requested:  '.grey + req.url.white);
		}
	} else {
		process.stdout.write('\u001b[0G');
		process.stdout.write('Processed requests:'.magenta.bold + ' [' + counters.total + '] API: [' + counters.api + ']...');
	}

	var s, file, t = '.';
	s = req.url;
	if (s == '/UI/') {
		s = '/index.html';
	}
	if (config.quiet) {
		file = (s || '').toLowerCase();
		if (file.indexOf('html') !== -1) {
			t = 'h';
		}
		if (file.indexOf('.js') !== -1) {
			t = 'j';
		}
		if (file.indexOf('.ttf') !== -1 || file.indexOf('.woff') !== -1 || file.indexOf('.eot') !== -1 || file.indexOf('.svg') !== -1 || file.indexOf('.otf') !== -1) {
			t = 'f';
		}
		if (file.indexOf('.css') !== -1 || file.indexOf('.less') !== -1) {
			t = 's';
		}
		if (file.indexOf('.jpg') !== -1 || file.indexOf('.png') !== -1 || file.indexOf('.ico') !== -1 || file.indexOf('.gif') !== -1) {
			t = 'i';
		}
		process.stdout.write(t.gray);
	}
	s = s.replace(/^[\/\\]UI\//gi, ''); // remove "UI" from the beginning
	s = s.replace(/en\//gi, config.default_culture + '\/'); // switch to default culture

	if (/html/i.test(s)) {
		res.set('Content-Type', 'text/html');
	}

	s = replaceAll(config.local_server_ip, 'localhost', s); // change the default address for external _links

	req.url = '/' + s;
	if (req.url.indexOf('tour') !== -1) {
		//console.log('\nTour is substituted\n');
		return res.status(200).send();
	}

	if (!config.quiet && config.verbose) {
		console.log('\t                ' + req.url.grey);
	}
	/*
	var p = path.resolve(path.join(config.resources, req.url));
	if (!fs.existsSync(p)) {
		console.log('File not found', p.red);
	}
	//var content = fs.readFileSync(p);
	//res.send(content);
	console.log(s);
	*/
	next();
}

app.use(auth_proxy(/\/api\/(.*)/i));
app.use(compression());
app.use(middleHandler);
app.use(express.static(path.resolve(config.resources)));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
	console.log('');
	console.log('Error 404'.red.bold, req.url.red);
	res.status(404);
	return res.send('File not found');
});

app.use(function(err, req, res, next) {
	console.log('');
	console.log('Error 500'.red.bold);
	console.log(err);
	res.status(err.status || 500);
	return res.send('Internal error');
});

printHeader();

var stdin = process.stdin;
stdin.setRawMode(true);
stdin.setEncoding('utf8');

stdin.on('data', function(key) {
	if (key === '\u0003') {
		// ctrl-c
		console.log('');
		console.log('Exit.');
		process.exit();
	}
	if (key === '\u001b') {
		// esc
		console.log('');
		console.log('Exit.');
		process.exit();
	}
	if (key === 's' || key === 'S') {
		console.log('');
		console.log('Statistic:'.white.bold);
		console.log('  Total requests : ', counters.total);
		console.log('  API requests   : ', counters.api);

		return;
	}
	if (key === 'c' || key === 'C') {
		process.stdout.write('\u001B[2J\u001B[0;0f');
		printHeader();
		printKeyHelp();

		return;
	}
	if (key === 'r' || key === 'R') {
		console.log('');
		console.log('Reset stat'.yellow.bold);
		counters.total = 0;
		counters.api = 0;
		return;
	}
	if (key === 'l' || key === 'L') {
		console.log('');
		console.log('Swicth log'.yellow.bold);
		if (config.quiet) {
			config.quiet = false;
			console.log('Log is ON now'.green.bold);
		} else {
			config.quiet = true;
			console.log('Log is OFF now'.red.bold);
		}
		return;
	}
	if (key === 'v' || key === 'V') {
		console.log('');
		console.log('Change log level'.yellow.bold);
		if (config.quiet) {
			console.log('Use [L] key to switch log on'.red.bold);
		}
		if (config.verbose) {
			config.verbose = false;
			console.log('Log is minimal now'.gray.bold);
		} else {
			config.verbose = true;
			console.log('Log is full now'.green.bold);
		}
		return;
	}
	printKeyHelp();
});

app.listen(process.env.PORT || config.port);

var local_api_addr = config.mixed_proxy_addr + '/api/';

console.log('  Send proxy request to API: '.yellow, local_api_addr.yellow.bold + '...');
http.get(local_api_addr, function(res) {
	if (res.statusCode !== 200) {
		console.log('Exit with status code -' + res.statusCode.toString().red.bold);
		process.exit(0 - res.statusCode);
	} else {
		console.log('  All right, auth passed.\n'.cyan);
		console.log('[ ' + 'READY'.cyan.bold + ' ]');
		printKeyHelp();
	}
}).on('error', function(e) {
	console.log("Got error: " + e.message);
	process.exit(-2);
});

function printKeyHelp() {
	console.log('');
	if (config.start_for_remote_access) {
		console.log('[ ' + 'REMOTE ACCESS MODE'.bold.red + ' ]',
			'Use http://' + config.local_server_ip.bold.green + ':'.green + (process.env.PORT || config.port).toString().bold.green + '/UI/#/ url to access');
	}
	console.log('Keys:'.gray.bold);
	console.log('  [Ctrl+C]'.cyan + ' or ' + '[ESC]'.cyan + ' to exit');
	console.log('  [S]'.cyan + ' to show current stat');
	console.log('  [R]'.cyan + ' to reset stat');
	console.log('  [L]'.cyan + ' to switch requests logging (now: ' + (config.verbose ? 'on' : 'off') + ')');
	console.log('  [V]'.cyan + ' to change log level (now: ' + (config.verbose ? 'verbose' : 'minimal') + ')');
	console.log('  [C]'.cyan + ' to clear console');
}

function printHeader() {
	console.log('+------------------------------+'.gray)
	console.log('|  '.gray + 'picoServer for TwinfieldUI'.green.bold + '  |'.gray);
	console.log('+------------------------------+'.gray)
	console.log('');
	console.log('  Server is listening on port'.gray, (process.env.PORT || config.port).toString().white);
	console.log('  Resources path is set to   '.gray, path.resolve(config.resources).white);
	console.log('  NEO server base address    '.gray, config.neo_addr.white);
	console.log('');
}