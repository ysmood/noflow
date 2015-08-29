import http from "http";
import kit from "nokit";

function exit ({ code }) {
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

export default () => {
    let ken = kit.require("ken");
    return {
        eq: ken.eq,
        deepEq: ken.deepEq,
        it: ken(),
        request: kit.request,
        servant: genServant(),
        exit: exit
    };
};
