"use strict";

var http = require("http");
var kit = require("nokit");
var proxy = kit.require("proxy");
var flow = proxy.flow;

module.exports = function (opts) {
    var routes = [];

    routes.listener = flow(routes, opts);

    routes.listen = function () {
        routes.server = http.createServer(routes.listener);
        routes.server.listen.apply(routes.server, arguments);
    };

    return routes;
};

module.exports.midToFlow = proxy.midToFlow;
