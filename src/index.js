"use strict";

import http from "http";
import flow from "./flow";
import utils from "./utils";
import middlewares from "./middlewares";

var noflow = (opts) => {
    var routes = [];

    routes.listener = flow(routes, opts);

    routes.listen = () => {
        routes.server = http.createServer(routes.listener);

        return utils.yutils.promisify(
            routes.server.listen, routes.server
        ).apply(0, arguments);
    };

    return routes;
};

noflow.flow = flow;
utils.assign(noflow, middlewares);

export default noflow;
