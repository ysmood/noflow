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

    it("status code 500 with unending promise", async () => {
        let app = flow();

        var promise = {
            then (promise){}
        }
        // 
        app.push($ => $.body = promise);
        let res = await request(app)({ url: "/", body: false });

        return eq([res.statusCode], [500]);
    })

];
