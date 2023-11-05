const Glue = require('@hapi/glue');
const Routes = require('./Route');

const server = async () => {
    try {
        const manifest = {
            server: {
                host: 'localhost',
                port: 9001,
            }
        }
        const glue = await Glue.compose(manifest, {});
        glue.route(Routes);
        await glue.start();
        return glue;

    } catch (err) {
        console.log(err);
        process.exit(1);
    }
}
process.on('uncaughtException', (err) => {
    responseHandler.error(err);
    process.exit(1);
});

server().then(serve => { console.log(`Server is running on port ${serve.info.uri}`) })
    .catch((err) => {
        console.log(err);
        process.exit(1);
    })