import testSuit from "./testSuit";
import Promise from "yaku";

export default testSuit("compose", ({
    it, request, eq, flow
}) => {

    it("basic", () => {
        let app = flow();

        let c = 0;
        app.push(
            $ => (c++, $.next()),
            flow(
                $ => (c++, $.next()),
                flow(
                    $ => (c++, $.next()),
                    $ => (c++, $.next())
                )
            ),
            $ => $.body = c
        );

        return eq(request(app)(), "4");
    });

    it("arguments", () => {
        let app = flow();

        app.push(
            ({ next }) => next(),
            flow(
                ({ next }) => next(),
                $ => $.body = "final"
            )
        );

        return eq(request(app)(), "final");
    });

    it("parent catch composed error", () => {
        let app = flow();

        app.push(
            $ => {
                return $.next().catch((err) => {
                    $.body = `catch ${err}`;
                });
            },
            flow([
                () => { throw "err"; }
            ])
        );

        return eq(request(app)(), "catch err");
    });

    it("order by decreasing time", () => {
        let app = flow();

        let c = "";

        let p1 = new Promise((resolve) => {
            setTimeout(() => resolve("p1"), 200);
        });

        let p2 = new Promise((resolve) => {
            setTimeout(() => resolve("p2"), 100);
        });

        app.push(
            $ => {
                return p1.then((v) => {
                    c += v
                    return $.next();
                });
            },
            $ => {
                return p2.then((v) => {
                    c += v
                    return $.next();
                });
            },
            $ => {
                $.body = c;
            }
        );

        return eq(request(app)(), "p1p2");

    });

    it("order by increasing time", () => {
        let app = flow();

        let c = "";

        let p1 = new Promise((resolve) => {
            setTimeout(() => resolve("p1"), 100);
        });

        let p2 = new Promise((resolve) => {
            setTimeout(() => resolve("p2"), 200);
        });

        app.push(
            $ => {
                return p1.then((v) => {
                    c += v
                    return $.next();
                });
            },
            $ => {
                return p2.then((v) => {
                    c += v
                    return $.next();
                });
            },
            $ => {
                $.body = c;
            }
        );

        return eq(request(app)(), "p1p2");

    });

});
