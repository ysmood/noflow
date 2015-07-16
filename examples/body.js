import flow from "../index";
import kit from "nokit";

let app = flow();

app.push({
    url: "/promise",
    handler: kit.readJson("package.json")
}, {
    url: "/json",
    handler: { a: 10 }
}, {
    url: "/stream",
    handler: (ctx) => ctx.body = kit.createReadStream("index.js")
}, {
    url: "/promise-ctx",
    handler: kit.readJson("package.json")
}, {
    url: "/buffer",
    handler: kit.readFileSync("nofile.js")
});

app.listen(8123);
