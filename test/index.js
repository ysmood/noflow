import http from "http";
import kit from "nokit";

async function main () {
    // Get the test pattern from the env.
    let paths = await kit.glob(process.env.pattern);

    // load all the test file.
    let { code } = await it.async(
        paths
        .map(p => kit.path.resolve(p))
        .filter(p => p !== __filename)
        .reduce((s, p) => s.concat(require(p)(testSuit)), [])
    );

    process.exit(code);
}

function genServant () {
    let serverList = [];

    return {
        rand (fn) {
            let server = http.createServer(fn);
            serverList.push(server);

            let listen = kit.promisify(server.listen, server);

            return listen(0).then(() => {
                let { address, port } = server.address();
                return `${address}:${port}`;
            });
        },

        close () {
            serverList.forEach(s => s.close());
        }
    };
}

let ken = kit.require("ken");
let it = ken();
let testSuit = {
    eq: ken.eq,
    deepEq: ken.deepEq,
    it: it,
    request: kit.request,
    servant: genServant()
};

main().catch(err => {
    kit.logs(err && err.stack);
});
