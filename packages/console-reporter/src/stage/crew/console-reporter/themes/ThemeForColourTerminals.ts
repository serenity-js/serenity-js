import { ExecutionCompromised, ExecutionFailedWithAssertionError, ExecutionFailedWithError, ExecutionIgnored, ExecutionSkipped, ImplementationPending, Outcome } from '@serenity-js/core/lib/model';
import type { Chalk } from 'chalk'; // eslint-disable-line unicorn/import-style

import { TerminalTheme } from './TerminalTheme';

/**
 * Base class for `TerminalTheme` implementations intended
 * to print to terminals that support colour output.
 */
export abstract class ThemeForColourTerminals extends TerminalTheme {

    /**
     * @param {chalk~Chalk} chalk
     *
     * @see https://www.npmjs.com/package/chalk
     */
    constructor(protected readonly chalk: Chalk) {
        super();
    }

    /**
     * Joins the `parts` into a single string and decorates it
     * using a colour appropriate for a given `Outcome`.
     *
     * @param outcome
     *  an instance of an `Outcome`
     *  or a string class name of one of its implementations.
     *
     * @param parts
     *  the parts of the message to be decorated
     */
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
            // case ExecutionSuccessful.name:
            default:
                return this.chalk.green(this.joined(parts));
        }
    }
}
