import flow from "../index";
import kit from "nokit";

let app = flow();

app.push(ctx => {
    // "ctx.body" can be any line below, noflow will unbox the typed value sanely.

    // string
    ctx.body = "OK";

    // json
    ctx.body = { a: 10 };

    // stream
    ctx.body = kit.createReadStream("index.js");

    // promise
    ctx.body = kit.readJson("package.json");

    // buffer
    ctx.body = kit.readFileSync("nofile.js");
});

app.listen(8123);
