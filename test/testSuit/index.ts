import flow from "../../src";

var kit = require("nokit");
let { _ } = kit;
global.Promise = kit.Promise;


/**
 * It will let a noflow app instrance listen to a random port, then
 * request the port, then let the app close that port, then return a response
 * object.
 * `(app) => (url | { url, method, headers, reqData }) => Promise`
 */
let request = (app) => (opts) =>
    app.listen().then(() => {
        let host = `http://127.0.0.1:${app.server.address().port}`;
        if (_.isString(opts))
            opts = `${host}${opts}`;
        else if (_.isUndefined(opts))
            opts = host + "/";
        else
            opts.url = `${host}${opts.url}`;

        return kit.request(opts).then((res) => {
            return app.close().then(() => {
                return res;
            });
        });
    });

export default (title, fn) =>
    (it) =>
        it.describe(title, (it) =>
            fn({
                flow,
                kit,
                eq: it.eq,
                it,
                request
            })
        );
