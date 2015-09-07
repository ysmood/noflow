"use strict";

var kit = require("nokit");
var _ = kit._;
var br = kit.require("brush");

module.exports = function (task, option) {
    var enableES7 = _.curry(_.union, 2)(["--optional", "es7.asyncFunctions"]);

    option("-t <.*>", "unit test regex filter", ".*");
    function test (pattern) {
        return kit.spawn(
            "babel-node",
            enableES7(["test/index.js"]),
            { env: _.assign(process.env, { pattern: pattern }) }
        );
    }

    option("-n <examples/basic>", "example file name", "examples/basic");
    task("default", "run an example", function (opts) {
        kit.monitorApp({
            bin: "babel-node",
            args: enableES7([opts.N]),
            watchList: ["examples/**/*.js", "src/**/*.js"]
        });
    });

    task("build-docs", "build readme.md", function () {
        return kit.warp("src/**/*.js")
        .load(
            kit.drives.comment2md({ h: 2, tpl: "doc/readme.jst.md" })
        ).run();
    });

    task("build", ["build-docs"], "build src from es6 to es5", function () {
        return kit.spawn("babel", ["src", "--out-dir", "lib"]);
    });

    task("watch-test", "run & watch test api", function (opts) {
        function handler (path, curr, prev, isDel) {
            kit.logs(br.cyan("modifed:"), path);
            kit.logs(br.cyan("***** run unit tests *****"));
            if (!isDel) test(opts.T).catch(_.noop);
        }

        handler(".");
        kit.watchFiles("{test,src}/**/*.js", { handler: handler });
    });

    task("lint", "lint all code of this project", function () {
        function lint (f) {
            f.set(null);
            return kit.spawn("eslint", [f.path]);
        }

        return kit.warp("{examples,src,test}/**/*.js").load(lint).run();
    });

    task("test", ["lint"], "run test once", function () {
        test(".*").catch(function (res) {
            process.exit(res.code);
        });
    });

    task("benchmark", "run benchmark", function () {
        var paths = kit.globSync("benchmark/basic/*.js");
        var port = 3120;
        return kit.flow(paths.reverse().map(function (path) {
            return function () {
                var p = port++;
                var name = kit.path.basename(path, ".js");
                var child = kit.spawn("node", [path, p]).process;
                return kit.spawn("node", ["benchmark/index.js", p, name])
                .then(function () {
                    child.kill();
                });
            };
        }))();
    });
};
