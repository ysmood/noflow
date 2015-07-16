"use strict";

var http = require("http");
var kit = require("nokit");
var flow = kit.require("proxy").flow;

module.exports = function (opts) {
    var routes = [];

    routes.server = http.createServer(flow(routes, opts));
    routes.listen = routes.server.listen.bind(routes.server);

    return routes;
};
