export default ({
    it, request, eq, noflow
}) => [

    it("hello world", async () => {
        let app = noflow();

        app.push("hello world");

        return eq(await request(app)("/"), "hello world");
    })

];
