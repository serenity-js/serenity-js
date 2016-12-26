import express = require('express');
import { Server } from 'http';

export class AppServer {

    private instance?: Server;

    start(port: number = 0) {
        return () => new Promise<AppServer>((resolve, reject) => {
            let server = configured(express()).listen(port, () => {
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
    return configured(express()).listen(port);
}

function configured(app) {
    app.use('/js',  express.static(__dirname + '/js'));
    app.use('/css', express.static(__dirname + '/css'));

    app.use(express.static(__dirname + '/../../cookbook/apps', { extensions: ['html'] }));

    return app;
}
