"use strict";

import Promise from "yaku";
import yutils from "yaku/lib/utils";

export default {

    Promise: Promise,

    yutils: yutils,

    isFunction (value) {
        return typeof value === "function";
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
