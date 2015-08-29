import noflow from "../src";

let app = noflow();

app.push("hello world");

app.listen(8123);
