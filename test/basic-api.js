import testSuit from "./test-suit";
import flow from "../lib/flow";

let {
    it, servant, request, eq, exit
} = testSuit();

it.async([

    it("should flow hello world", () =>
        servant.rand(flow(["hello world"]))
        .then(host =>
            request(host + "/").then(
                body => eq("hello world", body)
            )
        )
    )

])
.then(exit);
