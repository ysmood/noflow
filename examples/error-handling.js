import noflow from "../src";

let app = noflow();

app.push(async ctx => {
    try {
        await ctx.next();
    } catch (e) {
        ctx.body = e;
    }
}, () => {
    throw "error";
});

app.listen(8123);
