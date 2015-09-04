import noflow from "../src";
import bodyParser from "body-parser";

let app = noflow();

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
