import flow, { MiddlewareFn } from "../lib";
import { parse } from "url";
import * as kit from "nokit";
let { select } = kit.require("proxy");

let app = flow();

let parseQuery: MiddlewareFn = $ => {
    $["query"] = parse($.req.url, true).query;
    return $.next();
};

// Only the selected url will waste CPU to parse the url.
app.push(
    select(
        "/item",

        // Here we use sub-route to compose two middlewares.
        flow(parseQuery, $ => $.body = $["query"].id)
    )
);

// Rest middlewares will keep tight and dry.
app.push("OK");

app.listen(8123);
