"use strict";

import Promise from "yaku";
import yutils from "yaku/lib/utils";

export default {

    /**
     * The promise class that noflow uses: [Yaku](https://github.com/ysmood/yaku)
     * @type {Object}
     */
    Promise: Promise,

    /**
     * The promise helpers: [Yaku Utils](https://github.com/ysmood/yaku#utils)
     * @type {Object}
     */
    yutils: yutils,

    isFunction (value) {
        return typeof value === "function";
    },

    isArray (value) {
        return value instanceof Array;
    },

    assign (src, ...dests) {
        var len = dests.length;
        var dest;
        for (var i = 0; i < len; i++) {
            dest = dests[i];
            for (var k in dest) {
                src[k] = dest[k];
            }
        }
        return src;
    }

};
