import flow from "../lib";
let app = flow();

let timeSpan = () => {
    let start = Date.now();
    return () => Date.now() - start;
};

// x-response-time
app.push(({ res, next }) => {
    let ts = timeSpan();
    return next().then(() => {
        res.setHeader("x-response-time", ts() + "ms");
    });
});

// logger
app.push(({ req: { method, url }, next }) => {
    let ts = timeSpan();
    return next().then(() => {
        console.log("%s %s - %s", method, url, ts());
    });
});

// response
app.push($ => {
    $.body = "hello world";
});

app.listen(8123);
