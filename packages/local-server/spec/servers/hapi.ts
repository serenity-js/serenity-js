// https://github.com/hapijs/hapi
import * as hapi from 'hapi';

const server = new hapi.Server();

server.route({ method: 'GET', path: '/', handler: (req, h) => 'Hello World!' });

export = {
    description: 'Hapi app',
    handler: server.listener,
};
