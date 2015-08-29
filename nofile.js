"use strict";

var kit = require("nokit");

module.exports = function (task, option) {
    function enableES7 (args) {
        return [
            "--optional",
            "es7.asyncFunctions"
        ].concat(args);
    }

    option("-n <basic>", "example file name", "basic");
    task("default", "run an example", function (opts) {
        kit.monitorApp({
            bin: "babel-node",
            args: enableES7(["examples/" + opts.N])
        });
    });

    task("watch-test", "run & watch test api", function () {
        kit.watchDir("test", {
            patterns: "test/**/*.js",
            handler: function (type, path) {
                if (type === "delete") return;
                kit.spawn("babel-node", enableES7([path]));
            }
        });
    });

    task("lint", "lint all code of this project", function () {
        function lint (f) {
            f.set(null);
            return kit.spawn("eslint", [f.path]);
        }

        return kit.warp("{examples,lib,test}/**/*.js").load(lint).run();
    });

    task("test", ["lint"], "run test once", function () {
        return kit.globSync("test/**/*.js").map(function (path) {
            return kit.spawn("babel-node", enableES7([path]));
        });
    });
};
