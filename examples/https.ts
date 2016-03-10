/*
    This demos how to serve http and https at the same time.
 */

import flow from "../src";
let http = require("http");
let https = require("https");
import { readFileSync } from "fs";

let opts = {
    key: readFileSync("test/testSuit/server.key"),
    cert: readFileSync("test/testSuit/server.crt")
};

let handler = flow("hello world");

// We here use the same handler for http and https on different port.
http.createServer(handler).listen(8123);
https.createServer(opts, handler).listen(8124);

// curl -k http://127.0.0.1:8123
// curl -k https://127.0.0.1:8124
