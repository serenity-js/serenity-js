// https://github.com/restify/node-restify
import * as restify from 'restify';

export = {
    node: '>= 6.9',
    description: 'Restify app',
    handler: () => {
        const server = restify.createServer();

        server.get('/', (req, res, next) => {
            res.send('Hello World!');
        });

        return server;
    },
};
