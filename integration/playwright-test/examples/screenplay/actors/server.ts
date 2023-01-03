import { createServer } from 'http';

export const server = createServer(function (request, response) {
    response.setHeader('Connection', 'close');
    response.end(`<html><body><h1 id="welcome-message">Welcome, ${ request.headers['user-agent'] }!</h1></body></html>`);
});
