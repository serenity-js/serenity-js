import type { Chalk } from 'chalk'; // eslint-disable-line unicorn/import-style

import { ThemeForColourTerminals } from './ThemeForColourTerminals';

/**
 * A simple colour theme for terminals with dark backgrounds.
 */
export class ThemeForDarkTerminals extends ThemeForColourTerminals {

    /**
     * @param {chalk~Chalk} chalk
     *
     * @see https://www.npmjs.com/package/chalk
     */
    constructor(chalk: Chalk) {
        super(chalk);
    }

    /**
     * Formats the heading
     *
     * @param parts
     *  `parts` to be converted to string, joined together, and formatted as a heading
     */
    heading(...parts: any[]): string {
        return this.chalk.bold.white(this.joined(parts));
    }

    /**
     * Decorates the heading with theme colours.
     *
     * @param pattern
     *  The pattern to be repeated to create a separator, for example `-`, `✂ - - `, etc.
     */
    separator(pattern: string): string {
        return this.chalk.yellow(this.repeat(pattern));
    }

    /**
     * Decorates the log entries that the developer wanted to have captured in the output.
     */
    log(...parts: any[]): string {
        return this.chalk.yellow(this.joined(parts));
    }
}
