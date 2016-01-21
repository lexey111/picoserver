'use strict';
var argv = require('yargs').argv;

var address, os = require('os'),
	ifaces = os.networkInterfaces();

// Iterate over interfaces ...
for (var dev in ifaces) {
	var iface = ifaces[dev].filter(function(details) {
		return details.family === 'IPv4' && details.internal === false;
	});
	if (iface.length > 0) address = iface[0].address;
}

module.exports = {
	verbose: false, // show each request details
	quiet: true, // disable log at all, except the errors
	port: 3000, // for the static server
	mixed_proxy_addr: 'http://localhost:3000', // where is working this script
	resources: '../../Sources/TwinfieldUI/Output', // site root
	neo_addr: 'http://localhost:8180', // where is Twinfield API
	default_culture: 'en-GB',
	local_server_ip: address,
	start_for_remote_access: argv.remote
};