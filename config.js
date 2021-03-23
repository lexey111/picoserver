'use strict';
var argv = require('yargs').argv;

var address, os = require('os'),
    ifaces = os.networkInterfaces();

// Iterate over interfaces ...
for (var dev in ifaces) {
    var iface = ifaces[dev].filter(function (details) {
        return details.family === 'IPv4' && details.internal === false;
    });
    if (iface.length > 0) address = iface[0].address;
}
var colors = require('colors');

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
console.log('    9. Start ' + 'pServer*.bat'.green.bold + ' again.');
console.log('');

module.exports = {
    verbose: false, // show each request details
    quiet: true, // disable log at all, except the errors
    port: 3000, // for the static server
    mixed_proxy_addr: 'http://localhost:3000', // where is working this script
    resources: '../Sources/TwinfieldUI/Output', // site root
    neo_addr: 'http://localhost:8180', // where is Twinfield API
    default_culture: 'en-GB',
    local_server_ip: '192.168.3.77',
    start_for_remote_access: argv.remote
};