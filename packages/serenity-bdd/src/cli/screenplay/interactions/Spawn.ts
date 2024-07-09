import type { Answerable, AnswersQuestions, CollectsArtifacts, UsesAbilities } from '@serenity-js/core';
import { Interaction } from '@serenity-js/core';
import type { Path } from '@serenity-js/core/lib/io';
import { d } from '@serenity-js/core/lib/io';
import { spawn } from 'child_process';

import { Complaint, ExecutionError, Notification } from '../../model';

/**
 * @package
 */
export class Spawn extends Interaction {
    static the(pathToExecutable: Answerable<Path>, ...args: string[]): Spawn {
        return new Spawn(pathToExecutable, args);
    }

    constructor(
        private readonly pathToExecutable: Answerable<Path>,
        private readonly args: string[],
    ) {
        super(d`#actor executes ${ pathToExecutable } with ${ args }`);
    }

    /**
     * Makes the provided [`Actor`](https://serenity-js.org/api/core/class/Actor/)
     * perform this [`Interaction`](https://serenity-js.org/api/core/class/Interaction/).
     */
    performAs(actor: UsesAbilities & AnswersQuestions & CollectsArtifacts): Promise<void> {
        return actor.answer(this.pathToExecutable)
            .then(pathToExecutable => new Promise((resolve, reject) => {
                actor.collect(Notification.fromJSON({ message: `Spawning: ${ pathToExecutable.value } ${ this.args.join(' ') }` }));

                const spawned = spawn(pathToExecutable.value, this.args, { stdio: [process.stdin, process.stdout, process.stderr] });

                spawned.once('error', (error: Error) =>
                    actor.collect(Complaint.fromJSON({ description: `Invoking Serenity BDD CLI has failed`, message: error.message, stack: error.stack })),
                );

                spawned.once('exit', (exitCode: number) =>
                    exitCode === 0
                        ? resolve(void 0)
                        : reject(new ExecutionError(`The following process exited with ${ exitCode }: ${ pathToExecutable.value } ${ this.args.join(' ') }`)),
                );
            }));
    }
}
