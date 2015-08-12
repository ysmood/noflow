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


# Quick Start

Install it: `npm i noflow`.

### Hello World Example

```javascript
import flow from "noflow";

let app = flow();

// Everything pushed into the app will be converted to a
// middleware object sanely, even it's a string, buffer or anything else.
app.push("hello world");

app.listen(8123);
```

### ES5

Without ES7, you can still have all the good stuffs of Noflow.

```javascript
var flow = require("noflow");

var app = flow();

app.push(

    function (ctx) {
        return ctx.next().then(function () {
            console.log("done");
        });
    },

    function (ctx) {
        ctx.body = "hello world";
    },

);

app.listen(8123);
```

### ES7

Designed for the future ES7.

```javascript
import flow from "noflow";

let app = flow();

app.push(

    async ({ next }) => {
        await next();
        console.log("done");
    },

    (ctx) => ctx.body = "hello world"

);

app.listen(8123);
```

# API

### `flow(opts) -> Array`

It returns an array, with some extra members:

- `server`: The Node native `http.Server`,
- `listen`: The Node native `http.Server.prototype.listen`
- `listener`: The http `requestListener` of the Node native `http.createServer`.
- `midToFlow (fn) -> fn`: Convert a `express.js` lick middleware to a NoFlow handler.

The array will hold all the routes. It's just this simple, nothing fancy.

For API details goto [API](https://github.com/ysmood/nokit#flowmiddlewares-opts).

# [NoKit](https://github.com/ysmood/nokit)

Noflow relies on the async nature of Promise, when you need async io tools, nokit will be the best choice.
nokit has all the commonly used IO functions with Promise support.

For example you can use them seamlessly:

```js
import flow from "noflow";
import kit from "nokit";

let app = flow();

app.push({
    url: "/a",
    handler: kit.readJson("a.json") // readJson returns a Promise
}, {
    url: "/b",
    handler: async (ctx) => {
        let txt = await kit.readFile("b.txt");
        let data = await kit.request(`http://test.com/${ctx.url}`);
        ctx.body = txt + data;
    }
});

app.listen(8123);
```
