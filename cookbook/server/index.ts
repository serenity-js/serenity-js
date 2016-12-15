import express = require('express');
import { Server } from 'http';

export class AppServer {

    private instance?: Server;

    constructor() {}

    start(port: number = 0) {
        return () => new Promise<AppServer>((resolve, reject) => {

            let app = express();

            app.use('/lib', express.static(__dirname + '/lib'));
            app.use(express.static(__dirname + '/../apps'));

            let server = app.listen(port, () => {
                this.instance = server;

                resolve(this);
            });
        });
    }

    demonstrating = (app: string) =>  `http://localhost:${ this.instance.address().port }/${ app }.html`;

    stop(): () => void {
        return () => this.instance.close();
    }
}

export function start(port: number = 8080) {
    let app = express();

    app.use('/lib', express.static(__dirname + '/lib'));
    app.use(express.static(__dirname + '/../apps'));

    return app.listen(port);
}
