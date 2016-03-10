import flow, { Routes } from "../../src";

let kit = require("nokit");
let { _ } = kit;
global.Promise = kit.Promise;

interface Fn {
    (arg: { flow: typeof flow, kit: any, eq: any, it: any, request }): any
}

/**
 * It will let a noflow app instrance listen to a random port, then
 * request the port, then let the app close that port, then return a response
 * object.
 * `(app) => (url | { url, method, headers, reqData }) => Promise`
 */
let request = (app: Routes) => (opts) =>
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

export default (title, fn: Fn) =>
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
