var express = require("express");
var port = process.argv[2];

var app = express();

app.use(function (req, res, next) {
    next();
});

app.use(function (req, res) {
    res.send("hello world");
});

app.listen(port);
