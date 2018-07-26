import * as events from '@serenity-js/core/lib/events';
import * as childProcess from 'child_process';

import { DTO } from '../child-process-reporter';
import { SpawnResult } from './SpawnResult';

export function spawner(pathToScript: string, options?: childProcess.ForkOptions) {
    return (...args: string[]): Promise<SpawnResult> => {

        const result: SpawnResult = {
            events: [],
            exitCode: undefined,
            stdout: '',
            stderr: '',
        };

        return new Promise((resolve, reject) => {
            const spawned = childProcess.fork(pathToScript, args, {
                ...options,
                ...{silent: true},
            });

            spawned.on('message', (message: DTO<events.DomainEvent>) => {
                result.events.push(events[ message.type ].fromJSON(message.value));
            });

            spawned.stdout.on('data', buffer => {
                result.stdout += buffer;
            });

            spawned.stderr.on('data', buffer => {
                result.stderr += buffer;
            });

            spawned.on('close', exitCode => {
                result.exitCode = exitCode;

                resolve(result);
            });
        });
    };
}
