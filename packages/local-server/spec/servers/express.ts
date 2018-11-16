// https://github.com/expressjs/express
import * as express from 'express';

export = {
    description: 'Express app',
    handler: express().
        get('/', (req: express.Request, res: express.Response) => {
            res.status(200).send('Hello World!');
        }),
};
