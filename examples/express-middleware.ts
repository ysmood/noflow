import flow from "../src";
let bodyParser = require("body-parser");
let kit = require("nokit");
let { midToFlow } = kit.require("proxy");

let app = flow();

app.push(
    midToFlow(bodyParser.json()),
    $ => {
        $.body = $.req["body"];
    }
);

app.listen(8123);
