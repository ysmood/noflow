import flow from "../src";

let app = flow();

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
