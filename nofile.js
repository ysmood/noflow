"use strict";

var kit = require("nokit");
var _ = kit._;
var br = kit.require("brush");

module.exports = function (task, option) {
    var enableES7 = _.curry(_.union, 2)(["--optional", "es7.asyncFunctions"]);

    option("-t <test/**/*.js>", "unit test filter", "test/**/*.js");
    function test (patterns) {
        return kit.async(kit.globSync(patterns).map(function (path) {
            return kit.spawn("babel-node", enableES7([path]));
        }));
    }

    option("-n <examples/basic>", "example file name", "examples/basic");
    task("default", "run an example", function (opts) {
        kit.monitorApp({
            bin: "babel-node",
            args: enableES7([opts.N]),
            watchList: ["examples/**/*.js", "lib/**/*.js"]
        });
    });

    task("watch-test", ["test"], "run & watch test api", function (opts) {
        kit.watchFiles("{test,lib}/**/*.js", {
            handler: function (path, curr, prev, isDel) {
                kit.logs(br.cyan("modifed:"), path);
                kit.logs(br.cyan("***** run unit tests *****"));
                if (!isDel) test(opts.T).catch(_.noop);
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

    task("test", ["lint"], "run test once", function (opts) {
        test(opts.T).catch(function (res) {
            process.exit(res.code);
        });
    });
};
