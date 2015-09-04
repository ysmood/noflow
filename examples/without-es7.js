var noflow = require("../src");
var app = noflow();

// log time
app.push($ => {
    var start = new Date();
    return $.next().then(() => {
        console.log(new Date() - start);
    });
});

// response
app.push($ => {
    $.body = "hello world";
});

app.listen(8123);
