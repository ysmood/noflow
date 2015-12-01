import flow from "../src";
import bodyParser from "body-parser";

let app = flow();

// Here we create a convert to convert normal express-middleware to a
// noflow middleware.
let convert = (h) => ({ req, res, next }) =>
    new Promise((resolve, reject) =>
        h(req, res, (err) => {
            if (err)
                return reject(err);
            else
                return next().then(resolve, reject);
        })
    );

app.push(
    convert(bodyParser.json()),
    $ => {
        $.body = $.req.body;
    }
);

app.listen(8123);
