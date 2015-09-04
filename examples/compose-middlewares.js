import noflow from "../src";
import { parse } from "url";
import kit from "nokit";
let { select } = kit.require("proxy");

let app = noflow();

let parseQuery = async $ => {
    $.query = parse($.req.url, true).query;
    await $.next();
};

// Only the selected url will waste CPU to parse the url.
app.push(
    select(
        { url: "/item" },

        // Here we use sub-route to compose two middlewares.
        noflow.flow(parseQuery, $ => $.body = $.query.id)
    )
);

// Rest middlewares will keep tight and dry.
app.push($ => $.body = "OK");

app.listen(8123);
