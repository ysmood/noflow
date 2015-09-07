import flow from "../src";

let app = flow();

app.push(async ($) => {
    try {
        await $.next();
    } catch (e) {
        $.body = e;
    }
}, () => {
    throw "error";
});

app.listen(8123);
