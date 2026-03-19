/* eslint-disable @typescript-eslint/explicit-module-boundary-types */

// https://github.com/restify/node-restify

// Dynamic import to avoid loading restify on Node versions where it's not supported
// restify uses spdy which uses http-deceiver which uses process.binding('http_parser')
// that was removed in Node 24
let restify: any;

export default {
    /*
    Restify does monkey-patching of the Request object,
    and tries to overwrite `closed` - https://github.com/restify/node-restify/blob/839fb4a2b5e5434d43e60e1abb936e153c659c31/lib/request.js#L848

    However, on Node 18 closed is a getter not a property, so this results in
    TypeError: Cannot set property closed of #<Readable> which has only a getter

    See https://github.com/restify/node-restify/issues/1888

    Additionally, restify uses spdy which uses http-deceiver which uses
    process.binding('http_parser') that was removed in Node 24.
     */
    node: '>=10.0 <18',
    description: 'Restify app',
    handler: (options?: any) => {
        // Lazy load restify only when actually needed
        if (!restify) {
            restify = require('restify');
        }

        const server = restify.createServer(options);

        server.get('/', (_request, response, _next) => {
            response.send('Hello World!');
        });

        return server;
    },
};
