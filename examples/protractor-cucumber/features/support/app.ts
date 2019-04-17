import express = require('express');

export const app = express()
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
