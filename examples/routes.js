import flow from "../index";
import path from "path";

let app = flow();

app.push({
    url: "/test",
    handler: (ctx) => ctx.body = ctx.url
}, {
    url: "/api",
    method: /GET|POST/,
    handler: (ctx) =>
        ctx.body = ctx.method + " " + ctx.url
}, {
    url: (url) => path.extname(url) === ".js" ? "js" : null,
    handler: (ctx) => ctx.body = ctx.url
}, {
    headers: {
        host: "a.com"
    },
    handler: (ctx) => ctx.body = "ok"
});

app.listen(8123);
