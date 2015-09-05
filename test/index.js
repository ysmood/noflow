import kit from "nokit";
import noflow from "../src";
let { _ } = kit;
let br = kit.require("brush");
let bname = kit.path.basename;

async function main () {
    // Get the test pattern from the env.
    let paths = await kit.glob(process.env.pattern);

    // load all the test file.
    let { code } = await it.async(
        paths
        .map(p => kit.path.resolve(p))
        .filter(p => p !== __filename)
        .reduce((s, p) => s.concat(require(p)(testSuit).map(title(p))), [])
    );

    process.exit(code);
}

let it = kit.require("ken")();
let testSuit = {
    eq: it.eq,
    it,
    noflow,
    flow: noflow.flow,
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
