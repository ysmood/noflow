"use strict";

var kit = require("nokit");

module.exports = function (task, option) {
    function enableES7 (args) {
        return [
            "--optional",
            "es7.asyncFunctions"
        ].concat(args);
    }

    option("-n <examples/basic>", "example file name", "examples/basic");
    task("default", "run an example", function (opts) {
        kit.monitorApp({
            bin: "babel-node",
            args: enableES7([opts.N]),
            watchList: ["examples/**/*.js", "lib/**/*.js"]
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
        function lint (isES6) { return function (f) {
            f.set(null);
            if (isES6) {
                return kit.spawn("eslint", [f.path]);
            } else {
                return kit.spawn("eslint", [
                    "-c", "es5lintrc.json",
                    "--no-eslintrc",
                    f.path
                ]);
            }
        }; }

        return kit.async([
            kit.warp("{examples,test}/**/*.js").load(lint(true)).run(),
            kit.warp("lib/**/*.js").load(lint(false)).run()
        ]);
    });

    task("test", ["lint"], "run test once", function () {
        return kit.globSync("test/**/*.js").map(function (path) {
            return kit.spawn("babel-node", enableES7([path]));
        });
    });
};
