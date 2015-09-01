import flow from "../src/flow";

export default ({
    it, servant, request, eq
}) => [

    it("hello world", async () => {
        let host = await servant.rand(flow(["hello world"]));
        let body = await request(host);
        eq(body, "hello world");
    })

];
