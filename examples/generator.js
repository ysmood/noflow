var flow = require("../src").default;
var async = require("yaku/lib/async");
var sleep = require("yaku/lib/sleep");

var app = flow();

app.push(async(function * ($) {
    $.body = yield sleep(1000, "OK");
}));

app.listen(8123);
