// https://github.com/restify/node-restify
import * as restify from 'restify';

const server = restify.createServer();

server.get('/', (req, res, next) => {
    res.send('Hello World!');
});

export = {
    description: 'Restify app',
    handler: server,
};
