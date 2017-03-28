var kit = require("nokit");
var port = process.argv[2];
var tName = process.argv[3];

function * request () {
    var count = 0;
    while (count++ < 3000)
        yield kit.request("http://127.0.0.1:" + port);
}

kit.sleep(1000).then(function () {
    console.time(tName);
    kit.async(3, request()).then(function () {
        console.timeEnd(tName);
    });
});
