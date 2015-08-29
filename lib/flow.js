"use strict";

var Promise = require("yaku"),
    http = require("http"),
    Stream = require("stream");

/**
 * expose the flow
 */
exports = module.exports = flow;

/**
 * @param {Array} [middlewares] Each item is a function `(ctx) -> Promise | Any`
 * or an object with the same type with `body`.
 * @return {Function} a requestListener
 */
function flow (middlewares) { return function (req, res) {
    var ctx, next;

    if (res) {
        // request, response paired listener
        ctx = {
            req: req,
            res: res,
            body: null
        };
    } else {
        ctx = req;

        req = ctx.req;
        res = ctx.res;

        next = ctx.next;
    }

    var index = 0;

    // Wrap the next middleware.
    ctx.next = function () {
        var mid = middlewares[index++];
        if (mid === undefined) {
            if (next) {
                ctx.next = next;
                return ctx.next();
            } else {
                // TODO: #4
                error404(ctx);
                return Promise.resolve();
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
    if (!next) {
        promise = promise.then(function () {
            endCtx(ctx);
        }, function (err) {
            errorAndEndCtx(err, ctx);
        });
    }

    return promise;
}; }

// Convert anything to a middleware function.
function ensureMid (mid) {
    if (isFunction(mid)) return mid;

    return function (ctx) { ctx.body = mid; };
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

function isFunction (value) {
    return typeof value === "function";
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
    endCtx(ctx);
}

function error404 (ctx) {
    ctx.res.statusCode = 404;
    ctx.body = http.STATUS_CODES[404];
}
