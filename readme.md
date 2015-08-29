# NoFlow

A minimal router for the future.
The interesting part is that it also works fine without any ES6 or ES7 syntax,
it's up to you to decide how fancy it will be. And because it's middlewares are just normal
functions, they can be easily composed with each other.

To use noflow, you only have to remember a single rule "Any async function should and will return a Promise.".

**For examples, goto folder [examples](examples)**.

To run the examples, you have to install the babeljs: `npm i -g babel`.
Such as, to run the [examples/basic.js](examples/basic.js), use command like:
`babel-node --optional es7.asyncFunctions examples/basic.js`

[![NPM version](https://badge.fury.io/js/noflow.svg)](http://badge.fury.io/js/noflow) [![Build Status](https://travis-ci.org/ysmood/noflow.svg)](https://travis-ci.org/ysmood/noflow) [![Build status](https://ci.appveyor.com/api/projects/status/github/ysmood/noflow?svg=true)](https://ci.appveyor.com/project/ysmood/noflow) [![Deps Up to Date](https://david-dm.org/ysmood/noflow.svg?style=flat)](https://david-dm.org/ysmood/noflow)

# Quick Start

Install it: `npm i noflow`.

### Hello World Example

```javascript
import noflow from "noflow";

let app = noflow();

// Everything pushed into the app will be converted to a
// middleware object sanely, even it's a string, buffer or anything else.
app.push("hello world");

app.listen(8123);
```

### ES5

Without ES7, you can still have all the good stuffs of Noflow.

```javascript
var noflow = require("noflow");

var app = noflow();

app.push(function (ctx) {
    return ctx.next().then(function () {
        console.log("done");
    });
});

app.push(function (ctx) {
    ctx.body = "hello world";
});

app.listen(8123);
```

### ES7

Designed for the future ES7.

```javascript
import noflow from "noflow";

let app = noflow();

app.push(

    async ({ next }) => {
        await next();
        console.log("done");
    },

    ctx => ctx.body = "hello world"

);

app.listen(8123);
```

# API

### `noflow(opts) -> Array`

It returns an array, with some extra members:

- `server`: The Node native `http.Server`.
- `listen`: Same with the Node native `http.Server.prototype.listen`, but returns a promise instead.
- `listener`: The http `requestListener` of the Node native `http.createServer`.
- `midToFlow (fn) -> fn`: Convert a `express.js` lick middleware to a NoFlow handler.

The array will hold all the routes. It's just this simple, nothing fancy.

For API details goto [API](https://github.com/ysmood/nokit#flowmiddlewares-opts).

# [NoKit](https://github.com/ysmood/nokit)

Noflow relies on the async nature of Promise, when you need async io tools, nokit will be the best choice.
nokit has all the commonly used IO functions with Promise support.

For example you can use them seamlessly:

```js
import noflow from "noflow";
import kit from "nokit";
let { select } = kit.require("proxy");

let app = noflow();

app.push(
    select(
        { url: "/a" },
        kit.readJson("a.json") // readJson returns a Promise
    ),

    select({ url: "/b" }, async ctx => {
        let txt = await kit.readFile("b.txt");
        let data = await kit.request(`http://test.com/${ctx.url}`);
        ctx.body = txt + data;
    })
);

app.listen(8123).then(() => {
    kit.request('127.0.0.1:8123/a').then(kit.logs);
});
```
