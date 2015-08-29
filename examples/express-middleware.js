import flow from "../src";
import bodyParser from "body-parser";

let app = flow();

app.push(
    flow.midToFlow(bodyParser.json()),
    ctx => {
        ctx.body = ctx.req.body;
    }
);

app.listen(8123);
