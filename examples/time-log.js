import noflow from "../src";
let app = noflow();

let timeSpan = () => {
    let start = new Date();
    return () => new Date() - start;
};

// x-response-time
app.push(async ({ res, next }) => {
    let ts = timeSpan();
    await next();
    res.setHeader("x-response-time", ts() + "ms");
});

// logger
app.push(async ({ req: { method, url }, next }) => {
    let ts = timeSpan();
    await next();
    console.log("%s %s - %s", method, url, ts());
});

// response
app.push(ctx => {
    ctx.body = "hello world";
});

app.listen(8123);
