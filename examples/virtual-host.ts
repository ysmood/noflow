// Work like nginx virtual host.

let kit = require("nokit");
import flow from "../lib";
let { select, static: st } = kit.require("proxy");
let app = flow();

app.push(
    select(
        { headers: { host: "a.com:8080" } },
        st("/var/www/a")
    )
);

app.push(
    select(
        { headers: { host: "b.com:8080" } },
        st("/var/www/b")
    )
);

app.listen(8080);
