// Work like nginx virtual host.

let kit = require("nokit");
import flow from "../src";
let { select, url, connect } = kit.require("proxy");
let app = flow();

app.push(
    select(
        { headers: { host: "a.com:8080" } },
        url("127.0.0.1:8001")
    )
);

app.push(
    select(
        { headers: { host: "b.com:8080" } },
        url("127.0.0.1:8002")
    )
);

// reverse proxy websocket
app.server.on("upgrade", connect({
    filter: (req) => req.host.match(/c\.com/),
    host: "127.0.0.1:8003"
}));

app.listen(8080);
