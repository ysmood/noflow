### This project is on its very early stage, it's not ready for production. PR and issue are welcomed.

# NoFlow

A minimal router for the future.
The interesting part is that it also works fine without any ES6 or ES7 syntax,
it's up to you to decide how fancy it will be.

To use noflow, you only have to remember a single rule "Any async function should and will return a Promise.".

For example goto [examples](examples).
For API details goto [API](https://github.com/ysmood/nokit#flowmiddlewares-opts).

To run the examples, you have to install the `npm i -g babel`, for
example, to run [examples/basic.js](examples/basic.js), use
`babel-node --optional es7.asyncFunctions examples/basic.js`


# Quick Start

Install it: `npm i noflow`.

### ES7

```javascript
import flow from "noflow";

let app = flow();

app.push(

    async ({ next }) => {
        await next();
        console.log('done');
    },

    (ctx) => ctx.body = "hello world"

);

app.listen(8123);
```

### ES5

```javascript
var flow = require("noflow");

var app = flow();

app.push(

    function (ctx) {
        return ctx.next().then(function () {
            console.log('done');
        });
    },

    function (ctx) {
        ctx.body = "hello world";
    },

);

app.listen(8123);
```
