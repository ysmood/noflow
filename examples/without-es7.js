var flow = require("../index");
var app = flow();

// log time
app.push(ctx => {
    var start = new Date();
    return ctx.next().then(() => {
        console.log(new Date() - start);
    });
});

// response
app.push(ctx => {
    ctx.body = "hello world";
});

app.listen(8123);
