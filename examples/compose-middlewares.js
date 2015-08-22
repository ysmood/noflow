import flow from "../index";
import { parse } from "url";

let app = flow();

let parseQuery = async ctx => {
    ctx.query = parse(ctx.req.url, true).query;
    await ctx.next();
};

// Only the selected url will waste CPU to parse the url.
app.push({
    url: "/item",
    // Here we use sub-route to compose two middlewares.
    handler: flow(parseQuery, ctx => ctx.body = ctx.query.id)
});

// Rest middlewares will keep tight and dry.
app.push(ctx => ctx.body = "OK");

app.listen(8123);
