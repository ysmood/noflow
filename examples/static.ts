import flow from "../src";
let kit = require("nokit");
let { select, static: st } = kit.require("proxy");

let app = flow();

app.push(
    // when you visit `/st/a.js` will return local file 'static/a.js'
    select("/st", st("static"))
);

app.listen(8123);
