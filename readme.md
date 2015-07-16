### This project is on its very early stage, it's not ready for production. PR and issue are welcomed.

# NoFlow

A minimal router for the future.
The interesting part is that it also works fine without any ES6 or ES7 syntax,
it's up to you to decide how fancy it will be. And because it's middlewares are just normal
functions, they can be easily composed with each other.

To use noflow, you only have to remember a single rule "Any async function should and will return a Promise.".

For examples, goto [examples](examples).

To run the examples, you have to install the babeljs: `npm i -g babel`.
Such as, to run the [examples/basic.js](examples/basic.js), use command like:
`babel-node --optional es7.asyncFunctions examples/basic.js`


# Quick Start

Install it: `npm i noflow`.

### Hello World Example

```javascript
import flow from "noflow";

let app = flow();

app.push("hello world");

app.listen(8123);
```

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

# API

### `flow(opts)`

It returns an array, with some extra members: `server` and `listen`,
they are the same within the node native `http.Server` and `http.Server.prototype.listen`.
The array will hold all the routes. It's just this simple, nothing fancy.

For API details goto [API](https://github.com/ysmood/nokit#flowmiddlewares-opts).

