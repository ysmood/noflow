"use strict";

var http = require("http");
var flow = require("../index");
var kit = require('nokit');

var routes = [
    async function (ctx) {
        var content = await kit.readFile(__filename);
        ctx.body = content;
    }
];

http.createServer(flow(routes)).listen(8123, function () {
    console.log("listen:", 8123);
});
