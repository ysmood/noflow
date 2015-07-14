"use strict";

var kit = require("nokit");

module.exports = function (task) {
    task("default", "run test", function () {
        kit.monitorApp({
            bin: "babel-node",
            args: [
                "--optional", "es7.asyncFunctions",
                "example/basic.js"
            ]
        });
    });
};
