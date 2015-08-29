var Promise = require('yaku'),
	http = require('http'),
	net = require('net'),
	Stream = require('stream');
	
/**
 * expose the flow
 */
exports = module.exports = flow;
	
	
/**
 * @param {Array} [middlewares]
 *  Each item is a function `(ctx) -> Promise | Any` or an object with the same type with `body`.
 * @return {Function} a requestListener
 */
function flow(middlewares) {
	var $err = {};

	function _tryMid(fn, ctx) {
		try {
			fn.call(undefined, ctx);
		} catch (e) {
			$err.e = e;
			return $err;
		}
	}

	var _reqListener = function (req, res) {
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
			
			var originalUrl = req.originalUrl;
			req.originalUrl = null;
		}
		
		var index = 0;
		var _wrappedNext = function _wrappedNext() {
			if (_.isString(req.originalUrl)) {
				req.url = req.originalUrl;
			}
			
			var middleware = middlewares[index++];
			if (middleware === undefined) {
				if (next) {
					ctx.next = next;
    				req.originalUrl = originalUrl;
    				return ctx.next();
				} else {
					// ###
					// I recommand to remove the 404 error when iterate over the middleware array
					// check the middleware before running
					// and always allow the last middleware to call ctx.next()
					_error404(ctx);
					return Promise.resolve();
				}
			}
			
			var fn = _.isFunction(middleware) ? middleware : function constant(ctx) { ctx.body = middleware; }
			var ret = _tryMid(fn, ctx);
			
			// has error
			return ret === $err ? Promise.reject($err.e) 
								: Promise.resolve(ret);
		}

		ctx.next = _wrappedNext;
		
		// go next
		var promise = ctx.next();
		if (!next) {
			//  only the root route has the error handler
			promise = promise.then(function onFinished() {
				// end the context
				_endCtx(ctx);
			}, function onError(err) {
				_errorAndEndCtx(err, ctx);
			});
		}
		
		return promise;
	}

	return _reqListener;
}

// grab from lodash
// underscore utils for internal callings
var _ = {
	isFunction: function baseIsFunction(value) {
		// it only occurs when IE non-edge document mode
		return typeof value == 'function' /* || false */;
	},
	isObjectLike: function isObjectLike(value) {
    	return !!value && typeof value == 'object';
  	},
	isString: function  isString(value) {
      return typeof value == 'string' || (_.isObjectLike(value) && Object.prototype.toString.call(value) == '[object String]');
    }
};

var _endRes = function _endRes(ctx, data, isStr) {
	var buf = isStr ? new Buffer(data) : data;
	
	if (!ctx.res.headersSent) {
		ctx.res.setHeader('Content-Length', buf.length);
	}

	ctx.res.end(buf);
};

var _endCtx = function _endCtx(ctx) {
	var body = ctx.body;
	var res = ctx.res;

	switch (typeof body) {
		case 'string':
			_endRes(ctx, body, true);
			break;

		case 'object':
			if (body === null) {
				res.end();
			} else if (body instanceof Stream) {
				body.pipe(res);
			} else if (body instanceof Buffer) {
				_endRes(ctx, body);
			} else if (_.isFunction(body.then)) {
				return body.then(function (data) {
					ctx.body = data;
					return _endCtx(ctx);
				});
			} else {
				if (!ctx.res.headersSent) {
					res.setHeader('Content-Type', 'application/json');
				}
				_endRes(ctx, JSON.stringify(body), true);
			}
			break;

		case 'undefined':
			res.end();
			break;

		default:
			_endRes(ctx, body.toString(), true);
			break;
	}
}

var _errorAndEndCtx = function _errorAndEndCtx(err, ctx) {
	if (ctx.res.statusCode === 200) {
		// alter to internal error
		ctx.res.statusCode = 500;
	}

	// print the error details
	if (err) {
		ctx.body = '<pre>\n' + (err instanceof Error ? err.stack : err) + '\n</pre>';
	} else {
		ctx.body = http.STATUS_CODES[ctx.res.statusCode];
	}
	
	// end the context
	_endCtx(ctx);
};

var _error404 = function (ctx) {
	ctx.res.statusCode = 404;
	ctx.body = http.STATUS_CODES[404];
}
		

			