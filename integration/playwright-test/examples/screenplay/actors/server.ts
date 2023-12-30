import { createServer } from 'http';

export const server = createServer(function (request, response) {
    response.setHeader('Connection', 'close');
    response.end(`
        <html>
            <body>
                <h1 id="welcome-message">Welcome, ${ request.headers['user-agent'] }!</h1>
                <a href="/open-new-tab-link" target="_blank" id="open-new-tab-link">Open new tab</a>
            </body>
        </html>`);
});
