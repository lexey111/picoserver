# picoserver

Very simple static server with auth redirect for TWF

1. Clone the repository
2. `npm i`
3. Open `config.js` and set up `resource` and `local_server_ip` fields, at least.
4. Create `auth_cookie.dat`:
   1. Open link http://localhost:8180/UI/#/Sales/Articles (or any other NEO URL according to your local settings) in your browser.
   2. Login to Twinfield if it required.
   3. Open Developer tool (F12 in Chrome browser).
   4. Switch to Network tab and refresh the page if no request has been recorded.
   5. Find the GET request to API/, it has to have response code 200 (if not - you need to login).
   6. Open the request headers tab.
   7. Copy all the content of the Cookie to clipboard.
   8. Open file auth_cookie.dat in the current folder anf replace its content by clipboard. Save it.

5. Start pServer*.bat

Both development (this Windows computer) and target (e.g. MacBook) should be in the same network and have to see each other (at least target computer must see dev machine) with `ping`.
