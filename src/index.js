"use strict";

import http from "http";
import flow from "./flow";
import utils from "./utils";

/**
 * Create an array instance with some handy server helper methods.
 * @type {Array} Members:
 * ```js
 * {
 *     server: http.Server,
 *
 *     // http.Server.prototype.listen, but returns a promise instead.
 *     listen: (port) => Promise,
 *
 *     close: (cb) => Promise,
 * }
 * ```
 * @example
 * ```js
 * import flow from "noflow"
 * let app = flow();
 * app.push("OK");
 * app.listen(8123).then(() => console.log("started"));
 * ```
 */
var app = function () {
    if (arguments.length > 0) {
        return flow.apply(0, arguments);
    }

    var routes = [];
    var server = http.createServer(flow(routes));

    routes.server = server;
    routes.listen = utils.yutils.promisify(server.listen, server);
    routes.close = utils.yutils.promisify(server.close, server);

    return routes;
};

utils.assign(app, utils);

export default app;
