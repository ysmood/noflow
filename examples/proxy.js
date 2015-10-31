// This example is a proxy for both http, https and websocket, etc.
// Set the system proxy to "127.0.0.1:8123", then have fun!

import kit from "../lib/kit";
let proxy = kit.require("proxy");
let { flow, select, static: st } = proxy;
let app = flow();

// hack a js file to a local js file
app.push(select(/a.js$/, ($) => $.body = kit.readFile("b.js")));

// hack a json api
app.push(select(/\/item-list$/, ($) => $.body = [1, 2, 3, 4]));

// hack url path starts with '/st' to local folder './static'
app.push(select("/st", st("static")));

// transparent proxy all the other http requests
app.push(proxy.url());

// transparent proxy https and websocket, etc
app.server.on("connect", proxy.connect());

app.listen(8123);
