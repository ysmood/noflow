"use strict";

var kit = require("nokit");

module.exports = function (task, option) {
    option("-n <basic>", "example name", "basic");

    task("default", "run test", function (opts) {
        kit.monitorApp({
            bin: "babel-node",
            args: [
                "examples/" + opts.N,
                "--optional", "es7.asyncFunctions"
            ]
        });
    });

    task("test-api", "run test api", function (opts) {
        kit.monitorApp({
            bin: "babel-node",
            args: [
                "test/" + opts.N,
                "whitelist", "es7.asyncFunctions es6.templateLiterals es6.destructuring es6.arrowFunctions"
            ]
        });
    });
};
