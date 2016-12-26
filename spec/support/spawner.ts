import {
    Activity,
    ActivityFinished,
    ActivityStarts,
    DomainEvent,
    Outcome,
    Scene,
    SceneFinished,
    SceneStarts,
    Tag,
} from '../../src/serenity/domain';

import { ForkOptions } from 'child_process';

import childProcess = require('child_process');

export class Spawned {
    messages: any[] = [];
    result: Promise<number>;

    constructor(pathToScript: string, args: string[], options: ForkOptions) {

        let spawned = childProcess.fork(pathToScript, args, options);

        spawned.on('message', event => this.messages.push(deserialised(event)));

        this.result = new Promise( (resolve, reject) => {
            spawned.on('close', exitCode => {
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
    const tagsFrom = (tags: Tag[]) => tags.map(_ => new Tag(_.type, _.values)),
          scene    = ({ name, category, path, tags, id }: Scene): Scene => new Scene(name, category, path, tagsFrom(tags), id),
          activity = ({ name, id }: Activity): Activity => new Activity(name, id),
          outcome  = <T>(type: (T) => T, { subject, result, error }: Outcome<T>) => new Outcome(type(subject), result, error);

    switch (event.type) {
        case 'SceneStarts':
            return new SceneStarts(
                scene(event.value),
                event.timestamp,
            );
        case 'ActivityStarts':
            return new ActivityStarts(
                activity(event.value),
                event.timestamp,
            );
        case 'ActivityFinished':
            return new ActivityFinished(
                outcome<Activity>(activity, event.value),
                event.timestamp,
            );
        case 'SceneFinished':
            return new SceneFinished(
                outcome<Scene>(scene, event.value),
                event.timestamp,
            );
        default:
            return event;
    }
}

export function spawner(pathToScript: string, options?: ForkOptions) {
    return (...args: string[]) => new Spawned(pathToScript, args, options);
};
