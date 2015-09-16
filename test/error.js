export default ({
    it, request, eq, flow
}) => [

    it("basic", async () => {
        let app = flow();

        app.push(
            async $ => {
                try {
                    await $.next();
                } catch (err) {
                    $.body = "catch:" + err;
                }
            },
            () => {
                throw "error";
            }
        );

        return eq(await request(app)(), "catch:error");
    }),

    it("status code 500 with error message", async () => {
        let app = flow();

        app.push(
            () => {
                throw "error";
            }
        );

        let res = await request(app)({ url: "/", body: false });

        return eq([res.statusCode, res.body], [500, "error"]);
    }),

    it("status code 500 with circle body object", async () => {
        let app = flow();

        // circle object
        var body = {};
        body.next = body;
        app.push($ => $.body = body);

        let res = await request(app)({ url: "/", body: false });

        return eq([res.statusCode], [500]);
    }),

    it("status code 400 with missing middlewares", async () => {
        let app = flow();
        let res = await request(app)({ url: "/", body: false });
        return eq([res.statusCode], [404]);
    }),

    // TODO: move to middlewares independently
    it("timeout", async () => {
        let app = flow();

        app.push(async ($) => {
            let p1 = new Promise((resolve, reject) => {
                setTimeout( () => {
                    $.body = "time out";
                    resolve();
                }, 100);

                let p2 = $.next();
                p2.then( (v) => resolve(v)).catch( (err) => reject(err) );
            });

            return p1;
        }, () => new Promise((r) => {
            setTimeout(r, 200);
        }));

        let body = await request(app)();

        return eq(body, "time out");
    })
];