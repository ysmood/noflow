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

    task("build-docs", "build readme.md", function () {
        return kit.warp("src/**/*.js")
        .load(
            kit.drives.comment2md({ h: 2, tpl: "doc/readme.jst.md" })
        ).run();
    });

    task("build", ["build-docs"], "build src from es6 to es5", function () {
        return kit.spawn("babel", ["src", "--out-dir", "lib"]);
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
        function lint (f) {
            f.set(null);
            return kit.spawn("eslint", [f.path]);
        }

        return kit.warp("{examples,src,test}/**/*.js").load(lint).run();
    });

    task("test", ["lint"], "run test once", function (opts) {
        test(opts.T).catch(function (res) {
            process.exit(res.code);
        });
    });
};
