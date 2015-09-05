export default ({
    it, request, eq, noflow, kit
}) => [

    it("hello world", async () => {
        let app = noflow();

        app.push("hello world");

        return eq(await request(app)("/"), "hello world");
    }),

    it("should print the 'hello world' by given handler", async () => {
        let app = noflow();

        app.push((ctx) => {
            ctx.body = "hello world";
        });

        return eq(await request(app)("/"), "hello world");
    }),

    it("should echo the request string by given handler", async () => {
        let app = noflow();
        let proxy = kit.require("proxy");

        app.push(proxy.body());

        app.push(async (ctx) => {
            ctx.body = "echo:" + ctx.reqBody;
        });

        return eq(
            await request(app)({url: "/", reqData: "XtX5cRfGIC"}),
            "echo:XtX5cRfGIC"
        );
    }),

    it("should echo the JSON object by given handler", async () => {
        let app = noflow();
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

        app.push(async (ctx) => {
            ctx.body = obj;
        });

        let respObj = JSON.parse(await request(app)({url: "/"}));
        return eq(obj, respObj);
    }),

    it("should response with application/json content type", async () => {
        let app = noflow();
        let obj = {
            prop1: 10
        };

        app.push(async (ctx) => {
            ctx.body = obj;
        });

        let resp = await request(app)({url: "/", body: false});
        return eq(resp.headers["content-type"], "application/json");
    }),

    it("should response with given content length", async () => {
        const FIX = 5;

        let app = noflow();
        let buf = new Buffer(FIX);

        app.push(async (ctx) => {
            ctx.body = buf;
        });

        let resp = await request(app)({url: "/", body: false});
        return eq(+resp.headers["content-length"], FIX);
    }),

    it("should echo the stream by given handler", async () => {
        let app = noflow();

        app.push(async (ctx) => {
            ctx.body = kit.createReadStream("package.json");
        });

        return eq(
            await request(app)({url: "/", resEncoding: null }),
            await kit.readFile("package.json")
        );
    }),

    it("should echo the buffer by given handler", async () => {
        let app = noflow();
        let buf = await kit.readFile("package.json");

        app.push(async (ctx) => {
            ctx.body = buf;
        });

        return eq(
            await request(app)({url: "/", resEncoding: null }),
            buf
        );
    })
];
