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

    /**
     * @desc
     *  Makes the provided {@link @serenity-js/core/lib/screenplay/actor~Actor}
     *  perform this {@link @serenity-js/core/lib/screenplay~Interaction}.
     *
     * @param {UsesAbilities & AnswersQuestions & CollectsArtifacts} actor
     * @returns {Promise<void>}
     *
     * @see {@link @serenity-js/core/lib/screenplay/actor~Actor}
     * @see {@link @serenity-js/core/lib/screenplay/actor~UsesAbilities}
     * @see {@link @serenity-js/core/lib/screenplay/actor~AnswersQuestions}
     * @see {@link @serenity-js/core/lib/screenplay/actor~CollectsArtifacts}
     */
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

    /**
     * @desc
     *  Generates a description to be used when reporting this {@link @serenity-js/core/lib/screenplay~Activity}.
     *
     * @returns {string}
     */
    toString(): string {
        return formatted `#actor executes ${ this.pathToExecutable } with ${ this.args }`;
    }
}
