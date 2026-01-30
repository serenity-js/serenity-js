/* eslint-disable @typescript-eslint/explicit-module-boundary-types */

// https://github.com/restify/node-restify

export = {
    /*
    Restify does monkey-patching of the Request object,
    and tries to overwrite `closed` - https://github.com/restify/node-restify/blob/839fb4a2b5e5434d43e60e1abb936e153c659c31/lib/request.js#L848

    However, on Node 18 closed is a getter not a property, so this results in
    TypeError: Cannot set property closed of #<Readable> which has only a getter

    See https://github.com/restify/node-restify/issues/1888
     */
    node: '>=10.0 <18',
    description: 'Restify app',
    handler: (options?: any) => {
        // Restify does monkey-patching on load, which breaks on Node 18
        const restify = require('restify');

        const server = restify.createServer(options);

        server.get('/', (request, response, next) => {
            response.send('Hello World!');
        });

        return server;
    },
};
