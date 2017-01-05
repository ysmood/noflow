import Promise from "yaku";
import testSuit from "./testSuit";
import * as https from "https";

module.exports = testSuit("basic", ({
    it, request, eq, flow, kit
}) => {

    it("hello world", () => {
        let app = flow();

        app.push("hello world");

        return eq(request(app)(), "hello world");
    });

    it("should print the 'hello world' by given handler", () => {
        let app = flow();

        app.push($ => {
            $.body = "hello world";
        });

        return eq(request(app)(), "hello world");
    });

    it("should echo the request string by given handler", () => {
        let app = flow();
        let proxy = kit.require("proxy");

        app.push(proxy.body());

        app.push($ => {
            $.body = "echo:" + $["reqBody"];
        });

        return eq(
            request(app)({url: "/", reqData: "XtX5cRfGIC"}),
            "echo:XtX5cRfGIC"
        );
    });

    it("should echo the JSON object by given handler", () => {
        let app = flow();
        let obj = {
            prop1: 10,
            prop2: "prop2",
            prop3: {
                subprop1: 1.0,
                subprop2: null,
                subprop3: true,
                subprop4: false
            }
        };

        app.push($ => {
            $.body = obj;
        });

        return request(app)({url: "/"}).then((respObj) => {
            return eq(obj, JSON.parse(respObj));
        });
    });

    it("should response with text/plain content type", () => {
        let app = flow();
        let obj = 10;

        app.push($ => {
            $.body = obj;
        });

        return request(app)({url: "/", body: false}).then((resp) => {
            return eq(resp.headers["content-type"], "text/plain");
        });
    });

    it("should response with application/json content type", () => {
        let app = flow();
        let obj = [1, 2, 3];

        app.push($ => {
            $.body = obj;
        });

        return request(app)({url: "/", body: false}).then((resp) => {
            return eq(resp.headers["content-type"], "application/json; charset=utf-8");
        });
    });

    it("should response with application/json content type", () => {
        let app = flow();
        let obj = {
            prop1: 10
        };

        app.push($ => {
            $.body = obj;
        });

        return request(app)({url: "/", body: false}).then((resp) => {
            return eq(resp.headers["content-type"], "application/json; charset=utf-8");
        });
    });

    it("should response with application/octet-stream content type", () => {
        let app = flow();
        let obj = new Buffer([1, 2, 3]);

        app.push($ => {
            $.body = obj;
        });

        return request(app)({url: "/", body: false}).then((resp) => {
            return eq(resp.headers["content-type"], "application/octet-stream");
        });
    });

    it("should response with text/html content type", () => {
        let app = flow();
        let obj = "test";

        app.push($ => {
            $.body = obj;
        });

        return request(app)({url: "/", body: false}).then((resp) => {
            return eq(resp.headers["content-type"], "text/html; charset=utf-8");
        });
    });

    it("should response with given content length", () => {
        const FIX = 5;

        let app = flow();
        let buf = new Buffer(FIX);

        app.push($ => {
            $.body = buf;
        });

        return request(app)({url: "/", body: false}).then((resp) => {
            return eq(+resp.headers["content-length"], FIX);
        });
    });

    it("should response あおい with content length 9", () => {
        let app = flow();
        app.push("あおい");

        return request(app)({url: "/", body: false}).then((res) => {
            return eq(res.headers["content-length"], "9");
        });
    });

    it("should echo the promise by given handler", () => {
        let app = flow();

        app.push($ => {
            $.body = kit.readFile("package.json");
        });

        return eq(request(app)({url: "/", resEncoding: null }), kit.readFile("package.json"));
    });

    it("should echo the stream by given handler", () => {
        let app = flow();

        app.push($ => {
            $.body = kit.createReadStream("package.json");
        });

        return eq(request(app)({url: "/", resEncoding: null }), kit.readFile("package.json"));
    });

    it("should response `null` with status code 204", () => {
        let app = flow();
        app.push(null);

        return eq(request(app)({url: "/", body: false}).then(e => e.statusCode), 204);
    });

    it("should response `undefined` with status code 204", () => {
        let app = flow();
        app.push($ => $.body = undefined);

        return eq(request(app)({url: "/", body: false}).then(e => e.statusCode), 204);
    });

    it("should response `null` with status code 204", () => {
        let app = flow();
        app.push($ => $.body = null);

        return eq(request(app)({url: "/", body: false}).then(e => e.statusCode), 204);
    });

    it("should echo the buffer by given handler", () => {
        let app = flow();

        return kit.readFile("package.json").then((buf) => {
            app.push($ => {
                $.body = buf;
            });

            return eq(
                request(app)({url: "/", resEncoding: null }),
                buf
            );
        })
    });

    it("should work with https", (after) => {
        let opts = {
            key: kit.readFileSync("test/testSuit/server.key"),
            cert: kit.readFileSync("test/testSuit/server.crt")
        };

        let server;

        after(() => {
            server.close();
        });

        return new Promise((resolve) => {
            server = https.createServer(opts, flow(["hello world"]))
            .listen(0, () => {
                let { port } = server.address();

                resolve(it.eq(kit.request({
                    url: `https://127.0.0.1:${port}`,
                    rejectUnauthorized: false
                }), "hello world"));
            });
        });

    });
});
