import kit from "nokit";
import flow from "../../src";
let { _ } = kit;
global.Promise = kit.Promise;

/**
 * It will let a noflow app instrance listen to a random port, then
 * request the port, then let the app close that port, then return a response
 * object.
 * `(app) => (url | { url, method, headers, reqData }) => Promise`
 */
let request = (app) => async (opts) => {
    await app.listen();

    let host = `http://127.0.0.1:${app.server.address().port}`;
    if (_.isString(opts))
        opts = `${host}${opts}`;
    else if (_.isUndefined(opts))
        opts = host + "/";
    else
        opts.url = `${host}${opts.url}`;

    let res = await kit.request(opts);

    await app.close();

    return res;
};

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
