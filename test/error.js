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
    })

];
