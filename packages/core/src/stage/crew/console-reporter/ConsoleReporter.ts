import { match } from 'tiny-types';

import { ActivityFinished, ActivityStarts, DomainEvent, SceneFinished, SceneStarts } from '../../../events';
import {
    ExecutionCompromised,
    ExecutionFailedWithAssertionError,
    ExecutionFailedWithError,
    ExecutionIgnored,
    ExecutionSkipped,
    ExecutionSuccessful,
    ImplementationPending,
    Outcome,
    ProblemIndication,
} from '../../../model';
import { StageCrewMember } from '../../StageCrewMember';
import { StageManager } from '../../StageManager';
import WriteStream = NodeJS.WriteStream;

/**
 * @desc A basic reporter printing output to stdout.
 *
 * @example <caption>Instantiation</caption>
 * const reporter = new ConsoleReporter(process.stdout, process.stderr)
 *
 * @experimental
 */
export class ConsoleReporter implements StageCrewMember {
    private stageManager: StageManager;
    private currentIndentation = 0;
    private spacesPerIntend = 4;

    constructor(
        private readonly stdout: WriteStream = process.stdout,
        private readonly stderr: WriteStream = process.stderr,
    ) {
    }

    assignTo(stageManager: StageManager) {
        this.stageManager = stageManager;
    }

    notifyOf(event: DomainEvent): void {
        match<DomainEvent, void>(event)
            .when(SceneStarts,   ({ value }: SceneStarts) => {
                this.printBanner(value.location.path.value);
                this.indent();
                this.print(this.stdout, value.name.value);
            })
            .when(ActivityStarts,   ({ value }: SceneStarts) => {
                this.indent();
                this.print(this.stdout, value.name.value);
            })
            .when(ActivityFinished,   ({ value, outcome }: ActivityFinished) => {
                this.print(
                    outcome.isWorseThan(new ExecutionSuccessful()) ? this.stdout : this.stderr,
                    this.toStatusIcon(outcome),
                    value.name.value,
                );

                if (outcome instanceof ProblemIndication) {
                    this.print(
                        this.stderr,
                        outcome.error.stack,
                    );
                }

                this.outdent();
            })
            .when(SceneFinished, ({ value, outcome }: SceneFinished) => {
                this.outdent();

                this.print(
                    this.stdout,
                    this.toStatusIcon(outcome),
                    value.name.value,
                );

                if (outcome instanceof ProblemIndication) {
                    this.print(
                        this.stderr,
                        outcome.error.stack,
                    );
                }
                this.print(this.stdout, '');
            })
            .else(_ => {
                // do nothing;
            });
    }

    /**
     * @private
     * @param message
     */
    private printBanner(message: string) {
        this.print(this.stdout, '- '.repeat(40));
        this.print(this.stdout, '');
        this.print(this.stdout, message);
        this.print(this.stdout, '');
    }

    /**
     * @private
     * @param outcome
     */
    private toStatusIcon(outcome: Outcome): string {
        return match<Outcome, string>(outcome)
            .when(ExecutionCompromised,                _ => '✗ ')
            .when(ExecutionFailedWithError,            _ => '✗ ')
            .when(ExecutionFailedWithAssertionError,   _ => '✗ ')
            .when(ExecutionSkipped,                    _ => '⇢ ')
            .when(ExecutionIgnored,                    _ => '? ')
            .when(ImplementationPending,               _ => '☕')
            .when(ExecutionSuccessful,                 _ => '✓ ')
            .else(_ => '');
    }

    /**
     * @private
     */
    private indent() {
        this.currentIndentation += this.spacesPerIntend;
    }

    /**
     * @private
     */
    private outdent() {
        if (this.currentIndentation - this.spacesPerIntend >= 0) {
            this.currentIndentation -= this.spacesPerIntend;
        }
    }

    /**
     * @private
     * @param out
     * @param messages
     */
    private print(out: WriteStream, ...messages: string[]) {
        out.write([
            ' '.repeat(this.currentIndentation),
            ...messages,
            '\n',
        ].join(''));
    }
}
