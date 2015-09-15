import kit from "nokit";
import flow from "../src";
let { _ } = kit;
let br = kit.require("brush");
let bname = kit.path.basename;
global.Promise = kit.Promise;

async function main () {
    // Get the test pattern from the env.
    let paths = await kit.glob(["test/**/*.js", "!test/index.js"]);
    let reg = new RegExp(process.env.pattern);

    // load all the test file.
    await it.async(
        paths
        .map(p => kit.path.resolve(p))
        .reduce(
            (s, p) => s.concat(
                require(p)(testSuit)
                .map(title(p))
                .filter(({ msg }) => reg.test(msg.replace(/\x1B\[\d+m/g, "")))
            )
        , [])
    );
}

let it = kit.require("ken")();
let testSuit = {
    eq: it.eq,
    it,
    flow: flow,
    kit: kit,

    /**
     * It will let a noflow app instrance listen to a random port, then
     * request the port, then let the app close that port, then return a response
     * object.
     * `(app) => (url | { url, method, headers, reqData }) => Promise`
     */
    request: (app) => async (opts) => {
        await app.listen();

        let host = `http://127.0.0.1:${app.server.address().port}`;
        if (_.isString(opts))
            opts = `${host}${opts}`;
        else if (_.isUndefined(opts))
            opts = host + "/";
        else
            opts.url = `${host}${opts.url}`;

        let res = await kit.request(opts);

        await app.close();

        return res;
    }
};

function title (path) {
    return (fn) => {
        let n = bname(path, ".js");
        fn.msg = `${br.grey(n)}: ${fn.msg}`;
        return fn;
    };
}

main().catch(err => {
    kit.logs(err && err.stack);
});
