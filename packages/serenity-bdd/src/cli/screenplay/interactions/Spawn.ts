import { Answerable, AnswersQuestions, CollectsArtifacts, Interaction, UsesAbilities } from '@serenity-js/core';
import { formatted, Path } from '@serenity-js/core/lib/io';
import { spawn } from 'child_process';
import { Complaint, ExecutionError, Notification } from '../../model';

/**
 * @package
 */
export class Spawn extends Interaction {
    static the(pathToExecutable: Answerable<Path>, ...args: string[]) {
        return new Spawn(pathToExecutable, args);
    }

    constructor(
        private readonly pathToExecutable: Answerable<Path>,
        private readonly args: string[],
    ) {
        super();
    }

    performAs(actor: UsesAbilities & AnswersQuestions & CollectsArtifacts): PromiseLike<void> {
        return actor.answer(this.pathToExecutable)
            .then(pathToExecutable => new Promise((resolve, reject) => {
                actor.collect(Notification.fromJSON({ message: `Spawning: ${ pathToExecutable.value } ${ this.args.join(' ') }` }));

                const spawned = spawn(pathToExecutable.value, this.args, { stdio: [process.stdin, process.stdout, process.stderr] });

                spawned.once('error', (error: Error) =>
                    actor.collect(Complaint.fromJSON({ description: `Invoking Serenity BDD CLI has failed`, message: error.message, stack: error.stack })),
                );

                spawned.once('exit', (exitCode: number) =>
                    exitCode !== 0
                        ? reject(new ExecutionError(`The following process exited with ${ exitCode }: ${ pathToExecutable.value } ${ this.args.join(' ') }`))
                        : resolve(void 0),
                );
            }));
    }

    toString(): string {
        return formatted `#actor executes ${ this.pathToExecutable } with ${ this.args }`;
    }
}
