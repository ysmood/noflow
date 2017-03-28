import flow from "../lib";
import * as bodyParser from "body-parser";
import * as kit from "nokit";
let { midToFlow } = kit.require("proxy");

let app = flow();

app.push(
    midToFlow(bodyParser.json()),
    $ => {
        $.body = $.req["body"];
    }
);

app.listen(8123);
