/* eslint-disable @typescript-eslint/explicit-module-boundary-types, unicorn/consistent-function-scoping */
// https://nodejs.org/api/http.html#http_class_http_server
export = {
    node: '>= 6.9',
    description: 'bare-bones Node.js request handler',
    handler: () => (request, response) => {
        response.setHeader('Connection', 'close');
        response.end('Hello World!');
    },
};
