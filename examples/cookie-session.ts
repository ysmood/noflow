import flow from "../src";
let cookieSession = require("cookie-session");
let kit = require("nokit");
let { midToFlow } = kit.require("proxy");

let app = flow();

app.push(
    midToFlow(
        cookieSession({
            name: "app",
            secret: "password"
        })
    ),

    $ => {
        let session = $.req["session"];

        if (session.count) {
            session.count++;
        } else {
            session.count = 1;
        }

        $.body = session;
    }
);

app.listen(8123);
