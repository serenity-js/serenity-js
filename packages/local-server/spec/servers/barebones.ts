// https://nodejs.org/api/http.html#http_class_http_server
export = {
    description: 'bare-bones Node.js request handler',
    handler(request, response) {
        response.setHeader('Connection', 'close');
        response.end('Hello World!');
    },
};
