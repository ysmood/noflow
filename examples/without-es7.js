var flow = require("../index");
var app = flow();

// log time
app.push(function (ctx) {
    var start = new Date();
    return ctx.next().then(function () {
        console.log(new Date() - start);
    });
});

// response
app.push(function (ctx) {
    ctx.body = "hello world";
});

app.listen(8123);
