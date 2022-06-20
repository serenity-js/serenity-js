/* istanbul ignore file */

import { Chalk } from 'chalk'; // eslint-disable-line unicorn/import-style

import { ThemeForColourTerminals } from './ThemeForColourTerminals';

/**
 * @desc
 *  A simple colour theme for terminals with dark backgrounds.
 *
 * @extends {ThemeForColourTerminals}
 *
 * @public
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
     * @desc
     *  Formats the heading
     *
     * @param {...any[]} parts
     *  `parts` to be converted to string, joined together, and formatted as a heading
     *
     * @returns {string}
     */
    heading(...parts: any[]): string {
        return this.chalk.bold.white(this.joined(parts));
    }

    /**
     * @desc
     *  Decorates the heading with theme colours.
     *
     * @param {string} pattern
     *  The pattern to be repeated to create a separator, for example `-`, `✂ - - `, etc.
     *
     * @returns {string}
     */
    separator(pattern: string): string {
        return this.chalk.yellow(this.repeat(pattern));
    }

    /**
     * @desc
     *  Decorates the log entries that the developer wanted to have captured in the output.
     *
     * @param {...any[]} parts
     *
     * @returns {string}
     */
    log(...parts: any[]): string {
        return this.chalk.yellow(this.joined(parts));
    }
}
