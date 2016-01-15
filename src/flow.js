"use strict";

/*
    For the sake of performance don't use `let` key word here.
 */

var utils = require("./utils");
var http = require("http");
var Stream = require("stream");

var Promise = utils.Promise;
var isFunction = utils.isFunction;

/**
 * A promise based function composer.
 * @param  {Array} middlewares If an non-array passed in, the whole arguments
 * of this function will be treated as the middleware array.
 * Each item is a function `($) => Promise | Any`,
 * or an object with the same type with `body`.
 * If the middleware has async operation inside, it should return a promise.
 * The members of `$`, FlowContext:
 * ```js
 * {
 *     // It can be a `String`, `Buffer`, `Stream`, `Object` or a `Promise` contains previous types.
 *     body: Any,
 *
 *     // https://nodejs.org/api/http.html#http_http_incomingmessage
 *     req: http.IncomingMessage,
 *
 *     // https://nodejs.org/api/http.html#http_http_incomingmessage
 *     res: http.IncomingMessage,
 *
 *     // It returns a promise which settles after all the next middlewares are setttled.
 *     next: => Promise
 * }
 * ```
 * @return {Function} `(req, res) => Promise | Any` or `($) => Promise`.
 * The http request listener or middleware.
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
var flow = function (middlewares) { return function (req, res) {
    var $, parentNext, next;

    // If it comes from a http listener, else it comes from a sub noflow.
    if (res) {
        $ = { req: req, res: res };
    } else {
        $ = req;
        parentNext = $.next;

        req = $.req;
        res = $.res;
    }

    var index = 0;

    // Wrap the next middleware.
    $.next = next = function () {
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
    var promise = next();

    // The root middleware will finnally end the entire $ peacefully.
    if (!parentNext) {
        return promise
        .then(function () { return endCtx($); })
        .catch(function (err) { return errorAndEndCtx(err, $); });
    }

    return promise;
}; };

// Convert anything to a middleware function.
function ensureMid (mid) {
    if (isFunction(mid)) return mid;

    return function ($) { $.body = mid; };
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

function setStatusCode (res, code) {
    if (res.statusCode === 200) res.statusCode = code;
}

function endEmpty (res) {
    setStatusCode(res, 204);
    res.end();
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
            endEmpty(res);
        } else if (body instanceof Stream) {
            body.pipe(res);
        } else if (body instanceof Buffer) {
            endRes($, body);
        } else if (isFunction(body.then)) {
            return body.then(function (data) {
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

function errorAndEndCtx (err, $) {
    setStatusCode($.res, 500);

    if (process.env.NODE_ENV === "production") {
        $.body = http.STATUS_CODES[$.res.statusCode];
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

function error404 ($) {
    setStatusCode($.res, 404);
    $.body = http.STATUS_CODES[$.res.statusCode];
}

module.exports = function (middlewares) {
    // Make sure we pass in an array
    if (!utils.isArray(middlewares)) {
        middlewares = [].slice.call(arguments);
    }

    return flow(middlewares);
};
