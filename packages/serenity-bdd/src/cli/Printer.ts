import chalk = require('chalk');

/**
 * @package
 */
export class Printer {

    constructor(
        public readonly out: NodeJS.WritableStream,
        public readonly err: NodeJS.WritableStream,     // eslint-disable-line unicorn/prevent-abbreviations
    ) {
    }

    info(message: string): void {
        this.out.write(chalk.green(message) + '\n');
    }

    error(message: string): void {
        this.out.write(chalk.red(message) + '\n');
    }
}
