/* eslint-disable @typescript-eslint/explicit-module-boundary-types, unicorn/consistent-function-scoping */

// https://github.com/restify/node-restify
import * as restify from 'restify';

export = {
    node: '>= 6.9',
    description: 'Restify app',
    handler: (options?: any) => {
        const server = restify.createServer(options);

        server.get('/', (request, response, next) => {
            response.send('Hello World!');
        });

        return server;
    },
};
