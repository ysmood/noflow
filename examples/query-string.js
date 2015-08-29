import noflow from "../src";
import kit from "nokit";
let { parse } = require("url");
let { select } = kit.require("proxy");

let app = noflow();

app.push(
    // Such as "/path?id=10&name=jack"
    select({ url: "/path" }, ctx => {
        let url = parse(ctx.req.url, true);
        // Here the body will be "10 - jack".
        ctx.body = `${url.query.id} - ${url.query.name}`;
    })
);

// Or you can create a middleware to parse query string for all followed middlewares.
app.push(async ctx => {
    ctx.query = parse(ctx.req.url, true).query;
    await ctx.next();
});

// Now we can get the auto-parsed query string.
app.push(ctx => {
    ctx.body = ctx.query.id;
});

app.listen(8123);
