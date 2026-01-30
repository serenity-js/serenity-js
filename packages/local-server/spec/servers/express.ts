/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
// https://github.com/expressjs/express
import express from 'express';

export = {
    node: '>= 6.9',
    description: 'Express app',
    handler: () => express().
        get('/', (request: express.Request, response: express.Response) => {
            response.status(200).send('Hello World!');
        }),
};
