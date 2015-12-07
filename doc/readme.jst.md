# NoFlow

A minimal server middleware composer for the future.
It's mostly used to create http server, handle proxy, etc.
The interesting part is that it also works fine without any ES6 or ES7 syntax,
it's up to you to decide how fancy it will be. And because it's middlewares are just normal
functions, they can be easily composed with each other.

To use noflow, you only have to remember a single rule "Any async function should and will return a Promise.".

**For examples, goto folder [examples](examples)**.

To run the examples, you have to install the dependencies of this project: `npm i`.
Such as, to run the [examples/basic.js](examples/basic.js), use command like:
`node_modules/.bin/noe examples/basic.js`

[![NPM version](https://badge.fury.io/js/noflow.svg)](http://badge.fury.io/js/noflow) [![Build Status](https://travis-ci.org/ysmood/noflow.svg)](https://travis-ci.org/ysmood/noflow) [![Build status](https://ci.appveyor.com/api/projects/status/github/ysmood/noflow?svg=true)](https://ci.appveyor.com/project/ysmood/noflow) [![Deps Up to Date](https://david-dm.org/ysmood/noflow.svg?style=flat)](https://david-dm.org/ysmood/noflow)

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

app.push(function ($) {
    return $.next().then(function () {
        console.log("done");
    });
});

app.push(function ($) {
    $.body = "hello world";
});

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

    $ => $.body = "hello world"

);

app.listen(8123);
```

### Routes

You can write routes quickly by using select interface of [NoKit](https://github.com/ysmood/nokit).

```javascript
import flow from "noflow";
import kit from "nokit";
let { match, select } = kit.require("proxy");

let app = flow();

app.push(
    select("/test", $ => $.body = $.url),

    select(
        // Express.js like url selector.
        match("/items/:id"),
        $ => $.body = $.url.id
    ),

    select(
        {
            url: "/api",
            method: /GET|POST/ // route both GET and POST
        },
        $ => $.body = $.method + " " + $.url
    ),

    select(
        {
            // route some special headers
            headers: {
                host: "a.com"
            }
        },
        $ => $.body = "ok"
    )
);

app.listen(8123);
```

### Express middleware

It's easy to convert an express middleware to noflow middleware.

```javascript
import flow from "noflow";
import bodyParser from "body-parser";

let app = flow();

let convert = (h) => ({ req, res, next }) =>
    new Promise((resolve, reject) =>
        h(req, res, (err) => {
            if (err)
                return reject(err);
            else
                return next().then(resolve);
        })
    );

app.push(
    convert(bodyParser.json()),
    $ => {
        $.body = $.req.body;
    }
);

app.listen(8123);
```

# API

<%= doc['src/index.js'] %>

<%= doc['src/flow.js'] %>

<%= doc['src/utils.js'] %>

# [NoKit](https://github.com/ysmood/nokit)

Noflow relies on the async nature of Promise, when you need async io tools, nokit will be the best choice.
nokit has all the commonly used IO functions with Promise support.

For example you can use them seamlessly:

```js
import flow from "noflow";
import kit from "nokit";
let { select } = kit.require("proxy");

let app = flow();

app.push(
    select(
        { url: "/a" },
        kit.readJson("a.json") // readJson returns a Promise
    ),

    select({ url: "/b" }, async $ => {
        let txt = await kit.readFile("b.txt");
        let data = await kit.request("http://test.com/" + $.url);
        $.body = txt + data;
    })
);

app.listen(8123).then(() => {
    kit.request('127.0.0.1:8123/a').then(kit.logs);
});
```
