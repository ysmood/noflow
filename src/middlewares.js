"use strict";

import Promise from "yaku";

export default {

    /**
     * Convert a Express-like middleware to `proxy.flow` middleware.
     * @param  {Function} h `(req, res, next) =>`
     * @return {Function}   `(ctx) => Promise`
     */
    midToFlow: (h) => (ctx) =>
        new Promise((resolve, reject) =>
            h(ctx.req, ctx.res, (err) => {
                if (err)
                    return reject(err);
                else
                    return ctx.next().then(resolve);
            })
        )

};
