# picoserver

Very simple TWF auth-redirect server. Allows to run the development environment on local Windows-based machine and connect to it from MacOS or whatever.

## Installation

1. Clone the repository: `git clone git@github.com:lexey111/picoserver.git`
2. `npm i` to install the dependencies
3. Open `config.js` and set up `resource` and `local_server_ip` fields, at least.
4. Create `auth_cookie.dat`:
   1. Open link http://localhost:8180/UI/#/Sales/Articles (or any other NEO URL according to your local settings) using your preferred browser.
   2. Login to Twinfield if it needed.
   3. Open Developer tools (F12 in Chrome browser).
   4. Switch to Network tab and refresh the page if no request has been recorded yet.
   5. Find the GET request to API/, it has to have response code 200 (if not - you need to login back).
   6. Open the request headers tab.
   7. Copy all the content of the Cookie to clipboard (right click, `Copy value`).
   8. Open file `auth_cookie.dat` in the current folder anf replace its content by clipboard. Save it. Use `utf-8` encoding.

5. Start `pServer*.bat`

## Restrictions

Both development (this Windows computer) and target (e.g. MacBook) should be in the same network and have to see each other (at least target computer must see dev machine) with `ping`.

Port `3000` must be accessible on dev computer. Use firewall settings to temporarily disable filtering, or create special rule to allow such connections.

## Known issues

If you have `401 Unathorized` error even on local run, and you are sure your auth cookie is correct, check the cookie content. It sometimes happens that some invisible but invalid symbols are present in the cookie text. Use Notepad++ or any other editor which displays non-visible symbols.

If you can use local mode (`pServer.bat`) but not remote (`pServer.remote.bat`) check the connectivity between Windows and target machine: check the network, filtering rules, firewall etc.
