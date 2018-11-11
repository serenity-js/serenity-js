const
    port = process.env.PORT || 3000,
    runningInDevMode = `${ process.env.NODE_ENV }`.toLocaleLowerCase() === 'test';

(runningInDevMode ? inMemoryServer() : compiledServer())
    .use(require('morgan')('combined'))
    .listen(port, () => console.log(`Calculator server started on port ${ port }`));

// ---

function inMemoryServer() {
    require('ts-node/register');
    return require('./src/rest-api');
}

function compiledServer() {
    try {
        return require('./lib/rest-api');
    }
    catch(e) {
        console.error('Remember to compile the module before trying to start the server: npm run compile');
        process.exit(1);
    }
}
