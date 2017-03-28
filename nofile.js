var kit = require("nokit")

module.exports = (task, option) => {

    option("-n, --name <examples/basic>", "example file name", "examples/basic");
    option("-g, --grep <.*>", "unit test regex filter", ".*");

    task("default", "run an example", kit.async(function * (opts) {
        yield kit.spawn('tsc')

        kit.spawn('tsc', ['-w', '-p', 'tsconfig-dev.json'])

        if (!opts.name) return

        kit.monitorApp({
            bin: "node",
            args: [opts.name],
            isNodeDeps: false,
            watchList: ["examples/**/*.js", "src/**/*.js"]
        });
    }));

    task("build", ["lint", "build-ts"], "build", () => {
        return kit.warp("lib/*.ts")
        .load(
            kit.drives.comment2md({ h: 2, tpl: "doc/readme.jst.md" })
        ).run();
    });

    task("build-ts", "build src to lib", () => {
        return kit.spawn("tsc");
    });

    task("watch-test", "run & watch test api", (opts) =>
        kit.spawn("junit", [
            "-g", opts.grep,
            "-w", "{src,test}/**/*.js",
            "test/*.js"
        ])
    );

    task("lint", "lint all code of this project", () => {
        return kit.glob("{examples,lib,test}/**/*.ts").then((paths) => {
            return kit.spawn("tslint", ["-c", "tslint.json", ...paths])
        });
    });

    task("test", ["lint"], "run test once", (opts) =>
        kit.spawn("junit", [
            "-t", 20000,
            "-g", opts.grep,
            "test/*.js"
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
