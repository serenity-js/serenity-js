import type { Chalk } from 'chalk'; // eslint-disable-line unicorn/import-style

import { ThemeForColourTerminals } from './ThemeForColourTerminals';

/**
 * A simple colour theme for terminals with light backgrounds.
 */
export class ThemeForLightTerminals extends ThemeForColourTerminals {

    /**
     * @see https://www.npmjs.com/package/chalk
     */
    constructor(chalk: Chalk) {
        super(chalk);
    }

    /**
     * Decorates the heading with theme colours.
     *
     * @param parts
     *  `parts` to be converted to string, joined together, and formatted as a heading
     */
    heading(...parts: any[]): string {
        return this.chalk.bold.black(this.joined(parts));
    }

    /**
     * Decorates the heading with theme colours.
     *
     * @param pattern
     *  The pattern to be repeated to create a separator, for example `-`, `✂ - - `, etc.
     */
    separator(pattern: string): string {
        return this.repeat(pattern);
    }

    /**
     * Decorates the log entries that the developer wanted to have captured in the output.
     *
     * @param parts
     */
    log(...parts: any[]): string {
        return this.joined(parts);
    }
}
