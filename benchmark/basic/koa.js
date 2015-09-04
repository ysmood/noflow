var koa = require("koa");
var port = process.argv[2];

var app = koa();

app.use(function * (next) {
    yield next;
});

app.use(function * () {
    this.body = "hello world";
});

app.listen(port);
