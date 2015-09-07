import flow from "../src";
import kit from "nokit";

let app = flow();

app.push(($) => {
    // "$.body" can be set by any line below, flow will unbox the typed value sanely.

    // string
    $.body = "OK";

    // json
    $.body = { a: 10 };

    // stream
    $.body = kit.createReadStream("index.js");

    // promise
    $.body = kit.readJson("package.json");

    // buffer
    $.body = kit.readFileSync("nofile.js");
});

app.listen(8123);
