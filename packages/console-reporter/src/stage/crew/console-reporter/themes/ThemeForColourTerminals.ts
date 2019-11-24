import {
    ExecutionCompromised,
    ExecutionFailedWithAssertionError,
    ExecutionFailedWithError,
    ExecutionIgnored,
    ExecutionSkipped, ExecutionSuccessful,
    ImplementationPending,
    Outcome,
} from '@serenity-js/core/lib/model';
import { Chalk } from 'chalk';
import { Change, diffWords } from 'diff';
import { TerminalTheme } from './TerminalTheme';

export abstract class ThemeForColourTerminals extends TerminalTheme {
    constructor(protected readonly chalk: Chalk) {
        super();
    }

    outcome(outcome: Outcome | string, ...parts: any[]): string {
        const outcomeName = (outcome instanceof Outcome)
            ? outcome.constructor.name
            : outcome;

        switch (outcomeName) {
            case ExecutionCompromised.name:
                return this.chalk.magenta(this.joined(parts));
            case ExecutionFailedWithError.name:
            case ExecutionFailedWithAssertionError.name:
                return this.chalk.red(this.joined(parts));
            case ImplementationPending.name:
                return this.chalk.blue(this.joined(parts));
            case ExecutionSkipped.name:
            case ExecutionIgnored.name:
                return this.chalk.blackBright(this.joined(parts));
            case ExecutionSuccessful.name:
                return this.chalk.green(this.joined(parts));
        }
    }

    diff(expected: string, actual: string): string {
        if (! expected) {
            // if there's no expected value, just print the actual
            return `actual: ${ actual}`;
        }

        return diffWords(expected, actual)
            .map(change => this.colorise(change))
            .join('');
    }

    private colorise(change: Change): string {
        return !! change.added
            ? this.chalk.green(change.value)
            : change.removed
                ? this.chalk.red(change.value)
                : change.value;
    }
}
