"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lib_1 = require("../lib");
const async = require("yaku/lib/async");
const sleep = require("yaku/lib/sleep");
let app = lib_1.default();
app.push(async(function* ($) {
    $.body = yield sleep(1000, "OK");
}));
app.listen(8123);
