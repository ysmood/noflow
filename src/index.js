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
 *
 *     // The http `requestListener` of the Node native `http.createServer`.
 *     listener: (req ,res) => undefined
 * }
 * ```
 */
var noflow = (opts) => {
    var routes = [];

    routes.listener = flow(routes, opts);

    routes.listen = function () {
        routes.server = http.createServer(routes.listener);

        return utils.yutils.promisify(
            routes.server.listen, routes.server
        ).apply(0, arguments);
    };

    routes.close = function () {
        return utils.yutils.promisify(
            routes.server.close, routes.server
        ).apply(0, arguments);
    };

    return routes;
};

noflow.flow = flow;
utils.assign(noflow, utils);

export default noflow;
