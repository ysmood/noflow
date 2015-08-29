"use strict";

import http from "http";
import flow from "./flow";
import yutils from "yaku/lib/utils";

export default (opts) => {
    var routes = [];

    routes.listener = flow(routes, opts);

    routes.listen = () => {
        routes.server = http.createServer(routes.listener);

        return yutils.promisify(
            routes.server.listen, routes.server
        ).apply(0, arguments);
    };

    return routes;
};
