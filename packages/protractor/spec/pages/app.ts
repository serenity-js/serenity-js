import 'mocha';
import express = require('express');
import bodyParser = require('body-parser');

const pages = new Map<string, string>();

export const app = express()
    .use(bodyParser.text())
    .post('/pages/:id', (request: express.Request, response: express.Response) => {
        pages.set(request.params.id, request.body);
        return response.sendStatus(201);
    })
    .get('/pages/:id', (request: express.Request, response: express.Response) => {
        return pages.has(request.params.id)
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
