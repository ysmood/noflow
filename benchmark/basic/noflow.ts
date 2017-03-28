var flow = require("../../lib").default;
var port = process.argv[2];

var app = flow();

app.push(function ($) {
    return $.next();
}, function (ctx) {
    ctx.body("hello world");
});

app.listen(port);
