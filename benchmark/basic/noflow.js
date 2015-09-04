var noflow = require("../../lib");
var port = process.argv[2];

var app = noflow();

app.push(function ($) {
    return $.next();
}, function (ctx) {
    ctx.body("hello world");
});

app.listen(port);
