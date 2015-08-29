"use strict";

/*
    For the sake of performance don't use `let` key word here.
 */

import utils from "./utils";
import http from "http";
import Stream from "stream";

var { Promise, isFunction } = utils;

/**
 * A promise based middlewares proxy.
 * @param  {Array} middlewares Each item is a function `(ctx) => Promise | Any`,
 * or an object with the same type with `body`.
 * If the middleware has async operation inside, it should return a promise.
 * The promise can reject an error with a http `statusCode` property.
 * The members of `ctx`:
 * ```coffee
 * {
 *     # It can be a `String`, `Buffer`, `Stream`, `Object` or a `Promise` contains previous types.
 *     body: Any,
 *
 *     req: http.IncomingMessage,
 *
 *     res: http.IncomingMessage,
 *
 *     # It returns a promise which settles after all the next middlewares are setttled.
 *     next: => Promise
 * }
 * ```
 * @return {Function} `(req, res) => Promise | Any` or `(ctx) => Promise`.
 * The http request listener or middleware.
 */
var flow = (middlewares) => (req, res) => {
    var ctx, parentNext;

    // If it comes from a http listener, else it comes from a sub noflow.
    if (res) {
        ctx = { req: req, res: res, body: null };
    } else {
        ctx = req;
        parentNext = ctx.next;

        req = ctx.req;
        res = ctx.res;
    }

    var index = 0;

    // Wrap the next middleware.
    ctx.next = () => {
        var mid = middlewares[index++];
        if (mid === undefined) {
            // TODO: #4
            if (parentNext) {
                ctx.next = parentNext;
                return ctx.next();
            } else {
                return Promise.resolve(error404(ctx));
            }
        }

        var fn = ensureMid(mid);
        var ret = tryMid(fn, ctx);

        // Check if the fn has thrown error.
        if (ret === tryMid) {
            return Promise.reject(tryMid.err);
        } else {
            return Promise.resolve(ret);
        }
    };

    // Begin the initial middleware.
    var promise = ctx.next();

    // The root middleware will finnally end the entire ctx peacefully.
    if (!parentNext) {
        return promise.then(
            () => endCtx(ctx),
            err => errorAndEndCtx(err, ctx)
        );
    }

    return promise;
};

// Convert anything to a middleware function.
function ensureMid (mid) {
    if (isFunction(mid)) return mid;

    return ctx => { ctx.body = mid; };
}

// for better performance, hack v8.
function tryMid (fn, ctx) {
    try {
        return fn(ctx);
    } catch (err) {
        tryMid.err = err;
        return tryMid;
    }
}

function endRes (ctx, data, isStr) {
    var buf;
    if (isStr) {
        buf = new Buffer(data);
    } else {
        buf = data;
    }

    if (!ctx.res.headersSent) {
        ctx.res.setHeader("Content-Length", buf.length);
    }

    ctx.res.end(buf);
}

function endCtx (ctx) {
    var body = ctx.body;
    var res = ctx.res;

    switch (typeof body) {
    case "string":
        endRes(ctx, body, true);
        break;

    case "object":
        if (body == null) {
            res.end();
        } else if (body instanceof Stream) {
            body.pipe(res);
        } else if (body instanceof Buffer) {
            endRes(ctx, body);
        } else if (isFunction(body.then)) {
            return body.then(function (data) {
                ctx.body = data;
                return endCtx(ctx);
            });
        } else {
            if (!ctx.res.headersSent) {
                res.setHeader("Content-Type", "application/json");
            }
            endRes(ctx, JSON.stringify(body), true);
        }
        break;

    case "undefined":
        res.end();
        break;

    default:
        endRes(ctx, body.toString(), true);
        break;
    }
}

function errorAndEndCtx (err, ctx) {
    // An error shouldn't have a status code of 200.
    if (ctx.res.statusCode === 200) ctx.res.statusCode = 500;

    // print the error details
    if (err instanceof Error)
        ctx.body = err.stack;
    else
        ctx.body = err + "";

    // end the context
    return endCtx(ctx);
}

function error404 (ctx) {
    ctx.res.statusCode = 404;
    ctx.body = http.STATUS_CODES[404];
}

export default flow;
