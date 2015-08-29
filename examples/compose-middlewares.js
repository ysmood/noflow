import flow from "../src";
import { parse } from "url";
import kit from "nokit";
let { select } = kit.require("proxy");

let app = flow();

let parseQuery = async ctx => {
    ctx.query = parse(ctx.req.url, true).query;
    await ctx.next();
};

// Only the selected url will waste CPU to parse the url.
app.push(
    select(
        { url: "/item" },

        // Here we use sub-route to compose two middlewares.
        flow(parseQuery, ctx => ctx.body = ctx.query.id)
    )
);

// Rest middlewares will keep tight and dry.
app.push(ctx => ctx.body = "OK");

app.listen(8123);
