import noflow from "../src";
import bodyParser from "body-parser";

let app = noflow();

let convert = (h) => (ctx) =>
    new Promise((resolve, reject) =>
        h(ctx.req, ctx.res, (err) => {
            if (err)
                return reject(err);
            else
                return ctx.next().then(resolve);
        })
    );

app.push(
    convert(bodyParser.json()),
    ctx => {
        ctx.body = ctx.req.body;
    }
);

app.listen(8123);
