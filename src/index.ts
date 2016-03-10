/// <reference path="../typings/promisify.d.ts" />

"use strict";

import _flow, { Middleware, MiddlewareFunction, FlowHandler } from "./flow";
import * as http from "http";
import promisify = require("yaku/lib/promisify");
import { Thenable } from "yaku";

export interface RoutesListen {
    (): Thenable<http.Server>;

    (port: number, hostname?: string, backlog?: number): Thenable<http.Server>;
    (port: number, hostname?: string): Thenable<http.Server>;
    (path: string): Thenable<http.Server>;
    (handle: any): Thenable<http.Server>;
}

export interface RoutesClose {
    (): Thenable<http.Server>;
}

export class Routes extends Array<Middleware> {

    constructor () {
        super();

        this.server = http.createServer(_flow(this));

        this.listen = promisify(this.server.listen, this.server);
        this.address = this.server.listen.bind(this.server);
        this.close = promisify(this.server.close, this.server);
    }

    server: http.Server;

    address: { port: number; family: string; address: string; };

    listen: RoutesListen;

    close: RoutesClose;

}

export type MiddlewareM = Middleware;
export interface MiddlewareFunction extends MiddlewareFunction {};

export interface Flow {
    (): Routes;
    (...middlewares: Middleware[]): FlowHandler;
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
let flow: Flow = function () {
    if (arguments.length > 0) {
        return _flow.apply(0, arguments);
    }

    let routes = new Routes();

    return routes;
};

export default flow;
