import testSuit from "./testSuit";
import Promise from "yaku";

export default testSuit("error", ({
    it, request, eq, flow
}) => {

    it("basic", () => {
        let app = flow();

        app.push(
            $ => {
                return $.next().catch((err) => {
                    $.body = "catch:" + err;
                });
            },
            () => {
                throw "error";
            }
        );

        return eq(request(app)(), "catch:error");
    });

    it("status code 500 with error message", () => {
        let app = flow();

        app.push(
            () => {
                throw "error";
            }
        );

        let out = request(app)({ url: "/", body: false }).then(res => [res.statusCode, res.body]);

        return eq(out, [500, "error"]);
    });

    it("status code 500 with circle body object", () => {
        let app = flow();

        // circle object
        let body = { next: null };
        body.next = body;
        app.push($ => $.body = body);

        let out = request(app)({ url: "/", body: false }).then(res => res.statusCode);

        return eq(out, 500);
    });

    it("status code 404 with missing middlewares", () => {
        let app = flow();
        let out = request(app)({ url: "/", body: false }).then(res => res.statusCode);
        return eq(out, 404);
    });

    // TODO: move to middlewares independently
    it("timeout", () => {
        let app = flow();

        app.push(($) => {
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

        return eq(request(app)(), "time out");
    });
});