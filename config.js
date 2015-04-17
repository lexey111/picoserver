'use strict';

module.exports = {
	verbose: false, // show each request details
	port: 3000, // for the static server
	mixed_proxy_addr: 'http://localhost:3000', // where is working this script
	resources: '../../Web.UI.Static',
	api_addr: 'http://localhost:8180' // where is Twinfield API
};