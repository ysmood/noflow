"use strict";

var http = require("http");
var kit = require("nokit");
var flow = kit.require("proxy").flow;

module.exports = function (opts) {
    var routes = [];

    routes.listener = flow(routes, opts);

    routes.listen = function () {
        routes.server = http.createServer(routes.listener);
        routes.server.listen.apply(routes.server, arguments);
    };

    return routes;
};
