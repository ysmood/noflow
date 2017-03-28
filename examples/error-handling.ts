import flow from "../lib";

let app = flow();

app.push($ => {
    try {
        return $.next();
    } catch (e) {
        $.body = e;
    }
}, () => {
    throw "error";
});

app.listen(8123);
