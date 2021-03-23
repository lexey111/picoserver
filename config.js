'use strict';
const argv = require('yargs').argv;

module.exports = {
	verbose: false, // show each request details
	quiet: true, // disable log at all, except the errors
	port: 3000, // for the static server
	mixed_proxy_addr: 'http://localhost:3000', // where is working this script
	resources: '../../Sources/TwinfieldUI/Output', // site root
	neo_addr: 'http://localhost:8180', // where is the Twinfield API
	default_culture: 'en-GB',
	local_server_ip: '192.168.3.77',
	start_for_remote_access: argv.remote
};
