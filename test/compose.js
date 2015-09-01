export default ({
    it, request, eq, noflow, flow
}, title) => [

    it(title("basic"), async () => {
        let app = noflow();

        app.push(
            ({ next }) => next(),
            flow([
                ({ next }) => next()
            ]),
            "final"
        );

        eq(await request(app)("/"), "final");
    }),

    it(title("parent catch composed error"), async () => {
        let app = noflow();

        app.push(
            async (ctx) => {
                try {
                    await ctx.next();
                } catch (err) {
                    ctx.body = `catch ${err}`;
                }
            },
            flow([
                () => { throw "err"; }
            ])
        );

        eq(await request(app)("/"), "catch err");
    })

];
