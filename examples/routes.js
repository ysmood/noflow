import flow from "../src";
import path from "path";
import kit from "nokit";
let { match, select } = kit.require("proxy");

let app = flow();

app.push(
    select({ url: "/test" }, ctx => ctx.body = ctx.url),

    select(
        // Express.js like url selector.
        { url: match("/items/:id") },
        ctx => ctx.body = ctx.url.id
    ),

    select(
        {
            url: "/api",
            method: /GET|POST/ // route both GET and POST
        },
        ctx => ctx.body = ctx.method + " " + ctx.url
    ),

    select(
        // route js only
        { url: url => path.extname(url) === ".js" ? "js" : null },
        ctx => ctx.body = ctx.url
    ),

    select(
        {
            // route some special headers
            headers: {
                host: "a.com"
            }
        },
        ctx => ctx.body = "ok"
    )
);

app.listen(8123);
