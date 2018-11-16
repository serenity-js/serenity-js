// https://github.com/hapijs/hapi

export = {
    node: '>= 8.12',
    description: 'Hapi app',
    handler: () => {
        const hapi = require('hapi');   // tslint:disable-line:no-var-requires Requiring Hapi breaks the build on Node 6
        const server = new hapi.Server();

        server.route({ method: 'GET', path: '/', handler: (req, h) => 'Hello World!' });

        return server.listener;
    },
};
