import 'mocha';

import bodyParser from 'body-parser';
import type { Express } from 'express';
import express from 'express';

const pages = new Map<string, string>();

export const app: Express = express()
    .use(bodyParser.text())
    .post('/pages/:id', (request: express.Request, response: express.Response) => {
        pages.set(request.params.id, request.body);
        response.sendStatus(201);
    })
    .get('/pages/:id', (request: express.Request, response: express.Response) => {
        pages.has(request.params.id)
            ? response.send(pages.get(request.params.id))
            : response.sendStatus(404);
    })
    .delete('/pages/:id', (request: express.Request, response: express.Response) => {
        pages.delete(request.params.id);
        response.sendStatus(200);
    })
    .delete('/pages', (request: express.Request, response: express.Response) => {
        pages.clear();
        response.sendStatus(200);
    })
;
