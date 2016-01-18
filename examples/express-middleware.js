import flow from "../src";
import bodyParser from "body-parser";
import kit from "nokit";
let { midToFlow } = kit.require("proxy");

let app = flow();

app.push(
    midToFlow(bodyParser.json()),
    $ => {
        $.body = $.req.body;
    }
);

app.listen(8123);
