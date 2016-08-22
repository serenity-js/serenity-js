import {
    Activity,
    ActivityFinished,
    ActivityStarts,
    DomainEvent,
    Outcome,
    Scene,
    SceneFinished,
    SceneStarts,
} from '../src/serenity/domain';
import { ForkOptions } from 'child_process';

import childProcess = require('child_process');
import path = require('path');

const dirs: any = require(process.cwd() + '/gulpfile.config');   // tslint:disable-line:no-var-requires
const istanbul = process.cwd() + '/node_modules/.bin/istanbul';
const src = path.join(process.cwd(), dirs.staging.traspiled.all, 'src');

export class Spawned {
    messages: any[] = [];
    result: Promise<number>;

    constructor(pathToScript: string, args: string[], options: ForkOptions) {

        // let spawned = childProcess.fork(pathToScript, args, options);

        let spawned = childProcess.fork(istanbul, ['cover',
            '--dir', `${ process.cwd() }/${ dirs.staging.reports.coverage.behaviour }`,
            '--root', src,
            '--report', 'json',
            '--include-pid',
            '--include-all-sources',
            pathToScript,
            '--'].concat(args),
            options
        );

        spawned.on('message', event => this.messages.push(deserialised(event)));

        this.result = new Promise( (resolve, reject) => {
            spawned.on('close', (exitCode) => {
                if (exitCode !== 0) {
                    reject(exitCode);
                } else {
                    resolve(0);
                }
            });
        });
    }
}

function deserialised(event: any): DomainEvent<any> {
    const scene    = ({ name, category, path, id }: Scene): Scene => new Scene(name, category, path, id),
          activity = ({ name, id }: Activity): Activity => new Activity(name, id),
          outcome  = <T>(type: (T) => T, { subject, result, error }: Outcome<T>) => new Outcome(type(subject), result, error);

    switch (event.type) {
        case 'SceneStarts':
            return new SceneStarts(
                scene(event.value),
                event.timestamp
            );
        case 'ActivityStarts':
            return new ActivityStarts(
                activity(event.value),
                event.timestamp
            );
        case 'ActivityFinished':
            return new ActivityFinished(
                outcome<Activity>(activity, event.value),
                event.timestamp
            );
        case 'SceneFinished':
            return new SceneFinished(
                outcome<Scene>(scene, event.value),
                event.timestamp
            );
        default:
            return event;
    }
}

export function spawner(pathToScript: string, options?: ForkOptions) {
    return (...args: string[]) => new Spawned(pathToScript, args, options);
};
