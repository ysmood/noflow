export default ({
    it, request, eq, noflow
}, title) => [

    it(title("hello world"), async () => {
        let app = noflow();

        app.push("hello world");

        eq(await request(app)("/"), "hello world");
    })

];
