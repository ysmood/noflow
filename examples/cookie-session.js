import flow from "../src";
import cookieSession from "cookie-session";
import kit from "nokit";
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
        let { session } = $.req;

        if (session.count) {
            session.count++;
        } else {
            session.count = 1;
        }

        $.body = session;
    }
);

app.listen(8123);
