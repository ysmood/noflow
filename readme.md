# NoFlow

A minimal server middleware composer for the future.
It's mostly used to create http server, handle proxy, etc.
The interesting part is that it also works fine without any ES6 or ES7 syntax,
it's up to you to decide how fancy it will be. And because its middlewares are just normal
functions, they can be easily composed with each other.

To use noflow, you only have to remember a single rule "Any async function should and will return a Promise".

# Features

- Super lightweight, only one dependency, 200 sloc, learn it in 5 minutes
- Faster than Express.js and Koa, see the benchmark section
- Based on Promise, works well with async/await
- Supports almost all exist Express-like middlewares


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

- ## **[flow()](src/index.js?source#L29)**

    Create an array instance with some handy server helper methods.

    - **<u>return</u>**: { _Array_ }

        Members:
        ```js
        {
            // https://nodejs.org/api/http.html#http_class_http_server
            server: http.Server,

            // https://nodejs.org/api/http.html#http_server_listen_port_hostname_backlog_callback
            listen: (port) => Promise,

            // https://nodejs.org/api/http.html#http_server_close_callback
            close: (cb) => Promise,
        }
        ```

    - **<u>example</u>**:

        ```js
        import flow from "noflow"
        let app = flow();
        app.push("OK");
        app.listen(8123).then(() => console.log("started"));
        ```



- ## **[flow(middlewares)](src/flow.js?source#L59)**

    A promise based function composer.

    - **<u>param</u>**: `middlewares` { _Array_ }

        If an non-array passed in, the whole arguments
        of this function will be treated as the middleware array.
        Each item is a function `($) => Promise | Any`,
        or an object with the same type with `body`.
        If the middleware has async operation inside, it should return a promise.
        The members of `$`, FlowContext:
        ```js
        {
            // It can be a `String`, `Buffer`, `Stream`, `Object` or a `Promise` contains previous types.
            body: Any,

            // https://nodejs.org/api/http.html#http_http_incomingmessage
            req: http.IncomingMessage,

            // https://nodejs.org/api/http.html#http_http_incomingmessage
            res: http.IncomingMessage,

            // It returns a promise which settles after all the next middlewares are setttled.
            next: () => Promise
        }
        ```

    - **<u>return</u>**: { _Function_ }

        `(req, res) => Promise | Any` or `($) => Promise`.
        The http request listener or middleware.

    - **<u>example</u>**:

        Noflow encourages composition.
        ```js
        import flow from "noflow"
        let app = flow();
        let c = 0;
        app.push(
            $ => $.next(c++),
            flow(
                $ => $.next(c++),
                flow(
                    $ => $.next(c++),
                    $ => $.next(c++)
                )
            ),
            $ => $.body = c
        );
        app.listen(8123);
        ```



- ## **[Promise](src/utils.js?source#L12)**

    The promise class that noflow uses: [Yaku](https://github.com/ysmood/yaku)

    - **<u>type</u>**: { _Object_ }

- ## **[yutils](src/utils.js?source#L18)**

    The promise helpers: [Yaku Utils](https://github.com/ysmood/yaku#utils)

    - **<u>type</u>**: { _Object_ }




# Status code

Noflow will auto handle status code `200`, `204`, `404` and `500` for you only if
you haven't set the status code yourself.

- `204`: If you don't set `$.body`, such as it's `null` or `undefined`.

- `404`: If no middleware found.

- `500`: If any middleware reject or throws an error.

- `userDefined`: If user set the `$.res.statusCode` manually.

- `200`: If none of the above happens.


# Error handling

A middleware can catch all the errors of the middlewares after it.

With ES5, you can use it like normal promise error handling:

```js
var flow = require("noflow");

var app = flow();

app.push(function ($) {
    return $.next().catch(function (e) {
        $.body = e;
    });
});

app.push(function () {
    throw "error";
});

app.push(function () {
    // Same with the `throw "error"`
    return Promise.reject("error");
});

app.listen(8123);
```

With ES7, you can use try-catch directly:

```js
import flow from "noflow";

let app = flow();

app.push(async ($) => {
    try {
        await $.next();
    } catch (e) {
        $.body = e;
    }
});

app.push(() => {
    throw "error";
});

app.listen(8123);
```


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
        "/a",
        kit.readJson("a.json") // readJson returns a Promise
    ),

    select("/b", async $ => {
        let txt = await kit.readFile("b.txt");
        let data = await kit.request("http://test.com/" + $.url);
        $.body = txt + data;
    })
);

app.listen(8123).then(() => {
    kit.request('127.0.0.1:8123/a').then(kit.logs);
});
```

# Benchmark

These comparisons only reflect some limited truth, no one is better than all others on all aspects.
You can run it yourself in terminal: `npm run no -- benchmark`.

```
Node v5.4.0
The less the better:
noflow: 1839.333ms
koa: 2598.171ms
express: 3239.013ms
```
