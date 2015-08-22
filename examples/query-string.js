import flow from "../index";
let { parse } = require("url");

let app = flow();

app.push({
    // Such as "/path?id=10&name=jack"
    url: "/path",
    handler: (ctx) => {
        let url = parse(ctx.req.url, true);
        // Here the body will be "10 - jack".
        ctx.body = `${url.query.id} - ${url.query.name}`;
    }
});

app.listen(8123);
