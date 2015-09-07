export default ({
    it, request, eq, flow
}) => [

    it("basic", async () => {
        let app = flow();

        let c = 0;
        app.push(
            $ => $.next(c++),
            flow(
                $ => $.next(c++),
                flow(
                    $ => $.next(c++),
                    $ => $.next(c++)
                )
            ),
            $ => $.body = c
        );

        return eq(await request(app)(), "4");
    }),

    it("arguments", async () => {
        let app = flow();

        app.push(
            ({ next }) => next(),
            flow(
                ({ next }) => next(),
                ($) => $.body = "final"
            )
        );

        return eq(await request(app)(), "final");
    }),

    it("parent catch composed error", async () => {
        let app = flow();

        app.push(
            async ($) => {
                try {
                    await $.next();
                } catch (err) {
                    $.body = `catch ${err}`;
                }
            },
            flow([
                () => { throw "err"; }
            ])
        );

        return eq(await request(app)(), "catch err");
    })

];
