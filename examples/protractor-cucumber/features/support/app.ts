import express = require('express');

export const app = express()
    .get('/:id', (request: express.Request, response: express.Response) => {

        response.send(`<!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>Test Website number ${ request.params.id }</title>
            </head>
            <body />
            </html>
        `);
    })
    .get('/', (request: express.Request, response: express.Response) => {

        response.send(`<!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>Test Website</title>
            </head>
            <body />
            </html>
        `);
    });
