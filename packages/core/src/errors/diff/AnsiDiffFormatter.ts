import { Chalk, Instance as ChalkInstance } from 'chalk';   // eslint-disable-line unicorn/import-style

import { DiffFormatter } from './DiffFormatter';

/**
 * A {@apilink DiffFormatter} that uses [ANSI escape codes](https://en.wikipedia.org/wiki/ANSI_escape_code)
 * to format the output.
 *
 * @group Errors
 */
export class AnsiDiffFormatter implements DiffFormatter {
    constructor(private readonly chalk: Chalk = new ChalkInstance()) {
    }

    expected(line: string): string {
        return this.chalk.green(line);
    }

    received(line: string): string {
        return this.chalk.red(line);
    }

    unchanged(line: string): string {
        return line;
    }
}
