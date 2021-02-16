import 'mocha';
import express = require('express');
import bodyParser = require('body-parser');

const pages = new Map<string, string>();

export const app = express()
    .use(bodyParser.text())
    .post('/pages/:id', (req: express.Request, res: express.Response) => {
        pages.set(req.params.id, req.body);
        return res.sendStatus(201);
    })
    .get('/pages/:id', (req: express.Request, res: express.Response) => {
        return pages.has(req.params.id)
            ? res.send(pages.get(req.params.id))
            : res.sendStatus(404);
    })
    .delete('/pages/:id', (req: express.Request, res: express.Response) => {
        pages.delete(req.params.id);
        res.sendStatus(200);
    })
    .delete('/pages', (req: express.Request, res: express.Response) => {
        pages.clear();
        res.sendStatus(200);
    })
;
