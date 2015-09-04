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
 * @param  {Array} middlewares Each item is a function `($) => Promise | Any`,
 * or an object with the same type with `body`.
 * If the middleware has async operation inside, it should return a promise.
 * The promise can reject an error with a http `statusCode` property.
 * The members of `$`:
 * ```js
 * {
 *     // It can be a `String`, `Buffer`, `Stream`, `Object` or a `Promise` contains previous types.
 *     body: Any,
 *
 *     req: http.IncomingMessage,
 *
 *     res: http.IncomingMessage,
 *
 *     // It returns a promise which settles after all the next middlewares are setttled.
 *     next: => Promise
 * }
 * ```
 * @return {Function} `(req, res) => Promise | Any` or `($) => Promise`.
 * The http request listener or middleware.
 */
var flow = (middlewares) => (req, res) => {
    var $, parentNext;

    // If it comes from a http listener, else it comes from a sub noflow.
    if (res) {
        $ = { req: req, res: res, body: null };
    } else {
        $ = req;
        parentNext = $.next;

        req = $.req;
        res = $.res;
    }

    var index = 0;

    // Wrap the next middleware.
    $.next = () => {
        var mid = middlewares[index++];
        if (mid === undefined) {
            // TODO: #4
            if (parentNext) {
                return parentNext();
            } else {
                return Promise.resolve(error404($));
            }
        }

        var fn = ensureMid(mid);
        var ret = tryMid(fn, $);

        // Check if the fn has thrown error.
        if (ret === tryMid) {
            return Promise.reject(tryMid.err);
        } else {
            return Promise.resolve(ret);
        }
    };

    // Begin the initial middleware.
    var promise = $.next();

    // The root middleware will finnally end the entire $ peacefully.
    if (!parentNext) {
        return promise.then(
            () => endCtx($),
            err => errorAndEndCtx(err, $)
        );
    }

    return promise;
};

// Convert anything to a middleware function.
function ensureMid (mid) {
    if (isFunction(mid)) return mid;

    return $ => { $.body = mid; };
}

// for better performance, hack v8.
function tryMid (fn, $) {
    try {
        return fn($);
    } catch (err) {
        tryMid.err = err;
        return tryMid;
    }
}

function endRes ($, data, isStr) {
    var buf;
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

function endCtx ($) {
    var body = $.body;
    var res = $.res;

    switch (typeof body) {
    case "string":
        endRes($, body, true);
        break;

    case "object":
        if (body == null) {
            res.end();
        } else if (body instanceof Stream) {
            body.pipe(res);
        } else if (body instanceof Buffer) {
            endRes($, body);
        } else if (isFunction(body.then)) {
            return body.then((data) => {
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
        res.end();
        break;

    default:
        endRes($, body.toString(), true);
        break;
    }
}

function errorAndEndCtx (err, $) {
    // An error shouldn't have a status code of 200.
    if ($.res.statusCode === 200) $.res.statusCode = 500;

    // print the error details
    if (err instanceof Error)
        $.body = err.stack;
    else
        $.body = err + "";

    // end the context
    return endCtx($);
}

function error404 ($) {
    $.res.statusCode = 404;
    $.body = http.STATUS_CODES[404];
}

export default flow;
