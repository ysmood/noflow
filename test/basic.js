export default ({
    it, request, eq, noflow, kit, chainify
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
        
        app.push(async (ctx) => {
            let [data] = await chainify(ctx.req, "data");
            ctx.body = "echo:" + data;
        });
        
        return eq(await request(app)({url: "/", reqData: "XtX5cRfGIC"}), "echo:XtX5cRfGIC");
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
        return eq(kit._.isEqual(obj, respObj), true);
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
        return eq(parseInt(resp.headers["content-length"]), FIX);
    }),

    it("should echo the stream by given handler", async () => {
        let app = noflow();

        app.push(async (ctx) => {
            ctx.body = kit.createReadStream("package.json");;
        });

        let respBuf = await request(app)({url: "/", resEncoding: null});

        // read stream to buf
        let validateStream = kit.createReadStream("package.json");
        let buf = new Buffer(0);

        validateStream.on("data", (chunk) => {
            buf = Buffer.concat([buf, chunk]);
        });

        await chainify(validateStream, "end");

        return eq(Buffer.compare(buf, respBuf), 0);
    }),
    
    it("should echo the buffer by given handler", async () => {
        let app = noflow();
        let buf = kit.readFileSync("package.json");

        app.push(async (ctx) => {
            ctx.body = buf;
        });

        let respBuf = await request(app)({url: "/", resEncoding: null});
        return eq(Buffer.compare(buf, respBuf), 0);
    })
];
