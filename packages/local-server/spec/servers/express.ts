// https://github.com/expressjs/express
import * as express from 'express';

export = {
    node: '>= 6.9',
    description: 'Express app',
    handler: () => express().
        get('/', (req: express.Request, res: express.Response) => {
            res.status(200).send('Hello World!');
        }),
};
