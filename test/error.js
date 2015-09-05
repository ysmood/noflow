export default ({
    it, request, eq, noflow, flow
}) => [

    it("basic", async () => {
        let app = noflow();

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
    })

];
