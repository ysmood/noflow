export default ({
    it, request, eq, noflow, flow
}) => [

    it("basic", async () => {
        let app = noflow();

        app.push(
            ({ next }) => next(),
            flow([
                ({ next }) => next()
            ]),
            "final"
        );

        return eq(await request(app)("/"), "final");
    }),

    it("parent catch composed error", async () => {
        let app = noflow();

        app.push(
            async ($) => {
                try {
                    await $.next();
                } catch (err) {
                    $.body(`catch ${err}`);
                }
            },
            flow([
                () => { throw "err"; }
            ])
        );

        return eq(await request(app)("/"), "catch err");
    })

];
