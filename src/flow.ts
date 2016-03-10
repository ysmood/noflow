/// <reference path="../typings/node.d.ts" />

"use strict";

/*
    For the sake of performance don't use `let` key word here.
 */

import { isFunction, isArray } from "./utils";
import * as http from "http";
import { Stream } from "stream";
import Promise, { Thenable } from "yaku";

let { STATUS_CODES } = http;


export interface Context {
    /**
     * It will be auto set as the response body.
     */
    body: String | Buffer | Stream | Thenable<any> | Object;

    /**
     * https://nodejs.org/api/http.html#http_http_incomingmessage
     */
    req: http.IncomingMessage;

    /**
     * https://nodejs.org/api/http.html#http_http_serverresponse
     */
    res: http.ServerResponse;

    /**
     * It returns a promise which settles after all the next middlewares are setttled.
     */
    next: () => Promise<any>;

}

export interface MiddlewareFn {
    ($: Context): Thenable<any> | any;
}

export type Middleware = MiddlewareFn | Object;

export interface FlowHandler extends MiddlewareFn {
    (req: http.IncomingMessage, res: http.ServerResponse): Promise<any>;
}


/**
 * A promise based function composer.
 * @example
 * Noflow encourages composition.
 * ```js
 * import flow from "noflow"
 * let app = flow();
 * let c = 0;
 * app.push(
 *     $ => $.next(c++),
 *     flow(
 *         $ => $.next(c++),
 *         flow(
 *             $ => $.next(c++),
 *             $ => $.next(c++)
 *         )
 *     ),
 *     $ => $.body = c
 * );
 * app.listen(8123);
 * ```
 */
let flow = function(middlewares: Array<Middleware>): FlowHandler {
    return function(req, res?) {
        let $: Context, parentNext, next;

        // If it comes from a http listener, else it comes from a sub noflow.
        if (res) {
            $ = { req: req, res: res, body: null, next: null };
        } else {
            $ = req;
            parentNext = $.next;

            req = $.req;
            res = $.res;
        }

        let index = 0;

        // Wrap the next middleware.
        next = $.next = function() {
            let mid = middlewares[index++];
            if (mid === undefined) {
                // TODO: #4
                if (parentNext) {
                    return parentNext();
                } else {
                    return Promise.resolve(error404($));
                }
            }

            let ret = tryMid(ensureMid(mid), $);

            // Check if the fn has thrown error.
            if (ret === tryMid) {
                return Promise.reject(tryMidErr);
            } else {
                return Promise.resolve(ret);
            }
        };

        // Begin the initial middleware.
        let promise = next();

        // The root middleware will finnally end the entire $ peacefully.
        if (!parentNext) {
            return promise
                .then(function() { return endCtx($); })
                .then(undefined, function(err) { return errorAndEndCtx(err, $); });
        }

        return promise;
    };
};

// Convert anything to a middleware function.
function ensureMid(mid: Middleware) {
    if (isFunction(mid)) return <MiddlewareFn>mid;

    return function($: Context) { $.body = mid; };
}

// for better performance, hack v8.
let tryMidErr;
function tryMid(fn: MiddlewareFn, $: Context): Thenable<any> | typeof tryMid {
    try {
        return fn($);
    } catch (err) {
        tryMidErr = err;
        return tryMid;
    }
}

function endRes($: Context, data, isStr?: boolean) {
    let buf;
    if (isStr) {
        buf = new Buffer(data);
    } else {
        buf = data;
    }

    if (!$.res.headersSent) {
        $.res.setHeader("Content-Length", buf.length);
    }

    $.res.end(buf);
}

function setStatusCode(res: http.ServerResponse, code: number) {
    if (res.statusCode === 200) res.statusCode = code;
}

function endEmpty(res: http.ServerResponse) {
    setStatusCode(res, 204);
    res.end();
}

function endCtx($: Context) {
    let body = $.body;
    let res = $.res;

    switch (typeof body) {
        case "string":
            endRes($, body, true);
            break;

        case "object":
            if (body == null) {
                endEmpty(res);
            } else if (body instanceof Stream) {
                body.pipe(res);
            } else if (body instanceof Buffer) {
                endRes($, body);
            } else if (isFunction((<Thenable<any>>body).then)) {
                return (<Thenable<any>>body).then(function(data) {
                    $.body = data;
                    return endCtx($);
                });
            } else {
                if (!$.res.headersSent) {
                    res.setHeader("Content-Type", "application/json");
                }
                endRes($, JSON.stringify(body), true);
            }
            break;

        case "undefined":
            endEmpty(res);
            break;

        default:
            endRes($, body.toString(), true);
            break;
    }
}

function errorAndEndCtx(err: Error | any, $: Context) {
    setStatusCode($.res, 500);

    if (process.env.NODE_ENV === "production") {
        $.body = STATUS_CODES[$.res.statusCode];
    } else {
        // print the error details
        if (err instanceof Error)
            $.body = err.stack;
        else
            $.body = err + "";
    }

    // end the context
    return endCtx($);
}

function error404($: Context) {
    setStatusCode($.res, 404);
    $.body = STATUS_CODES[$.res.statusCode];
}

export default function(middlewares: Array<Middleware>) {
    // Make sure we pass in an array
    if (!isArray(middlewares)) {
        middlewares = [].slice.call(arguments);
    }

    return flow(middlewares);
};
