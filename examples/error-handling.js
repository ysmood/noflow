import noflow from "../src";

let app = noflow();

app.push(async $ => {
    try {
        await $.next();
    } catch (e) {
        $.body(e);
    }
}, () => {
    throw "error";
});

app.listen(8123);
