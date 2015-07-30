import flow from "../index";
import path from "path";
import kit from "nokit";
let { match } = kit.require("proxy");

let app = flow();

app.push({
    url: "/test",
    handler: ctx => ctx.body = ctx.url
}, {
    // Express.js like url selector.
    url: match("/items/:id"),
    handler: ctx => ctx.body = ctx.url.id
}, {
    url: "/api",
    method: /GET|POST/, // route both GET and POST
    handler: ctx => ctx.body = ctx.method + " " + ctx.url
}, {
    // route js only
    url: url => path.extname(url) === ".js" ? "js" : null,
    handler: ctx => ctx.body = ctx.url
}, {
    // route some special headers
    headers: {
        host: "a.com"
    },
    handler: ctx => ctx.body = "ok"
});

app.listen(8123);
