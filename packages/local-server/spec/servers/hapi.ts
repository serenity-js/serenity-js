// https://github.com/hapijs/hapi
import * as hapi from 'hapi';

export = {
    node: '>= 8.12',
    description: 'Hapi app',
    handler: () => {
        const server = new hapi.Server();

        server.route({ method: 'GET', path: '/', handler: (req, h) => 'Hello World!' });

        return server.listener;
    },
};
