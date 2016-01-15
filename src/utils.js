"use strict";

var Promise = require("yaku");
var yutils = require("yaku/lib/utils");

module.exports = {

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

    isFunction: function (value) {
        return typeof value === "function";
    },

    isArray: function (value) {
        return value instanceof Array;
    },

    assign: function (src, dest) {
        for (var k in dest) {
            src[k] = dest[k];
        }
        return src;
    }

};
