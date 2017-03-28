import flow from "../lib";
import * as async from "yaku/lib/async";
import * as sleep from "yaku/lib/sleep";

let app = flow();

app.push(async(function * ($) {
    $.body = yield sleep(1000, "OK");
}));

app.listen(8123);
