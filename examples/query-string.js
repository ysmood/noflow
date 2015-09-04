import noflow from "../src";
import kit from "nokit";
let { parse } = require("url");
let { select } = kit.require("proxy");

let app = noflow();

app.push(
    // Such as "/path?id=10&name=jack"
    select({ url: "/path" }, $ => {
        let url = parse($.req.url, true);
        // Here the body will be "10 - jack".
        $.body(`${url.query.id} - ${url.query.name}`);
    })
);

// Or you can create a middleware to parse query string for all followed middlewares.
app.push(async $ => {
    $.query = parse($.req.url, true).query;
    await $.next();
});

// Now we can get the auto-parsed query string.
app.push($ => {
    $.body($.query.id);
});

app.listen(8123);
