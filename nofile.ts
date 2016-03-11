/// <reference path="typings/node.d.ts" />

"use strict";

let kit = require("nokit");

module.exports = (task, option) => {

    option("-n, --name <examples/basic>", "example file name", "examples/basic");
    option("-g, --grep <.*>", "unit test regex filter", ".*");

    task("default", "run an example", (opts) => {
        kit.monitorApp({
            bin: "ts-node",
            args: [opts.name],
            watchList: ["examples/**/*.ts", "src/**/*.ts"]
        });
    });

    task("build", [], "build", () => {
        return kit.warp("src/*.ts")
        .load(
            kit.drives.comment2md({ h: 2, tpl: "doc/readme.jst.md" })
        ).run();
    });

    task("build-ts", ["clean"], "build src to lib", () => {
        return kit.spawn("tsc");
    });

    task("clean", "clean", () => {
        return kit.remove("lib");
    });

    task("watch-test", "run & watch test api", (opts) =>
        kit.spawn("junit", [
            "-g", opts.grep,
            "-w", "{src,test}/**/*.js",
            "test/*.js"
        ])
    );

    task("lint", "lint all code of this project", () => {
        return kit.glob("{examples,src,test}/**/*.ts").then((paths) => {
            return kit.spawn("tslint", ["-c", "tslint.json", ...paths])
        });
    });

    task("test", ["lint"], "run test once", (opts) =>
        kit.spawn("junit", [
            "-r", "ts-node/register",
            "-t", 20000,
            "-g", opts.grep,
            "test/*.ts"
        ])
    );

    task("benchmark", "run benchmark", () => {
        process.env.NODE_ENV = "production";
        let paths = kit.globSync("benchmark/basic/*.js");
        let port = 3120;
        console.log(`Node ${process.version}`);
        console.log(`The less the better:`);
        return kit.flow(paths.reverse().map((path) => {
            return () => {
                let p = port++;
                let name = kit.path.basename(path, ".js");
                let child = kit.spawn("node", [path, p]).process;

                return kit.spawn("node", ["benchmark/index.js", p, name])
                .then(() => {
                    child.kill();
                });
            };
        }))();
    });
};
