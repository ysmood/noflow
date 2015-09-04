import noflow from "../src";

let app = noflow();

app.push(async ({ body, next }) => {
    try {
        await next();
    } catch (e) {
        body(e);
    }
}, () => {
    throw "error";
});

app.listen(8123);
