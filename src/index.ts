/// <reference path="./promisify.d.ts" />

"use strict";

import * as _flow from "./flow";
import * as http from "http";
import promisify = require("yaku/lib/promisify");
import Promise from "yaku";

interface RoutesListen {
    (port: number): Promise<any>
}

interface RoutesClose {
    (): Promise<any>
}

class Routes extends Array<_flow.Middleware> {
    
    constructor (server: http.Server) {
        super();

        this.server = server;
        
        this.listen = promisify(server.listen, server);
        this.close = promisify(server.close, server);
    }
    
    server: http.Server
    
    listen: RoutesListen
    
    close: RoutesClose

}

interface Flow {
    (): Routes
    (...middlewares: _flow.Middleware[]): _flow.Middleware
}

/**
 * Create an array instance with some handy server helper methods.
 * @example
 * ```js
 * import flow from "noflow"
 * let app = flow();
 * app.push("OK");
 * app.listen(8123).then(() => console.log("started"));
 * ```
 */
var flow: Flow = function () {
    if (arguments.length > 0) {
        return _flow.default.apply(0, arguments);
    }

    var routes = new Routes(http.createServer(_flow.default(routes)));

    return routes;
};

module.exports = flow;
export default flow;
