import express = require('express');

export const app = express()
    .get('/:id', (req: express.Request, res: express.Response) => {

        res.send(`<!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>Test Website number ${ req.params.id }</title>
            </head>
            <body />
            </html>
        `);
    })
    .get('/', (req: express.Request, res: express.Response) => {

        res.send(`<!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>Test Website</title>
            </head>
            <body />
            </html>
        `);
    });
