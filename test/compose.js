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
    }),

    it("order by decreasing time", async () => {
        let app = flow();

        let c = "";

        let p1 = new Promise((resolve) => {
            setTimeout(() => resolve("p1"), 200);
        });

        let p2 = new Promise((resolve) => {
            setTimeout(() => resolve("p2"), 100);
        });

        app.push(
            async ($) => {
                c += await p1;
                await $.next();
            },
            async ($) =>{
                c += await p2;
                await $.next();
            },
            $ => {
                $.body = c;
            }
        );

        return eq(await request(app)(), "p1p2");

    }),

    it("order by increasing time", async () => {
        let app = flow();

        let c = "";

        let p1 = new Promise((resolve) => {
            setTimeout(() => resolve("p1"), 100);
        });

        let p2 = new Promise((resolve) => {
            setTimeout(() => resolve("p2"), 200);
        });

        app.push(
            async ($) => {
                c += await p1;
                await $.next();
            },
            async ($) => {
                c += await p2;
                await $.next();
            },
            $ => {
                $.body = c;
            }
        );

        return eq(await request(app)(), "p1p2");

    })

];
