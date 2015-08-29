import noflow from "../src";
import bodyParser from "body-parser";

let app = noflow();

app.push(
    noflow.midToFlow(bodyParser.json()),
    ctx => {
        ctx.body = ctx.req.body;
    }
);

app.listen(8123);
