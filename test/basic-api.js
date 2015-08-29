var http = require("http"),
    Promise = require("yaku"),
    kit = require("nokit");

var flow = require("../lib/flow");
var ken = kit.require("ken");
var it = ken();

it.async([
    it("should proxy flow handler", () => {
        var server = http.createServer(flow([echoData]));
        var listener = kit.promisify(server.listen, server);

        return listener(0).then(() => {
            return kit.request({
                url: `http://127.0.0.1:${server.address().port}`,
                reqData: "test"
            });
        }).then((body) => {
            ken.eq(body, "echo: test");
        }).then(() => {
            // close server
            server.close();
        }, (e) => { server.close(); throw e; });
    }),

    it("should proxy flow string middleware", () => {

        var server = http.createServer(flow(["string works"]));
        var listener = kit.promisify(server.listen, server);

        return listener(0).then(() => {
            return kit.request({
                url: `http://127.0.0.1:${server.address().port}`
            });
        }).then((body) => {
            ken.eq("string works", body);
        }).then(() => {
            // close server
            server.close();
        }, (e) => { server.close(); throw e; });
    })
]).then(({ failed }) => {
    process.exit(failed);
});

function echoData (ctx) {
    return new Promise((fulfill) => {
        ctx.req.on("data", (data) => {
            ctx.body = "echo: " + data;
            fulfill();
        });
    });
}
