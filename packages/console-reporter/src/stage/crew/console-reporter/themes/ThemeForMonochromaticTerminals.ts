import { Outcome } from '@serenity-js/core/lib/model';

import { TerminalTheme } from './TerminalTheme';

/**
 * @desc
 *  A simple colour theme for terminals with no colour support.
 *
 * @extends {TerminalTheme}
 *
 * @public
 */
export class ThemeForMonochromaticTerminals extends TerminalTheme {

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
        return this.joined(parts);
    }

    /**
     * Joins the `parts` into a single string.
     * Since this class represents a theme for monochromatic terminals,
     * no decoration of the text is performed.
     *
     * @param outcome
     *  an instance of an {@apilink Outcome}
     *  or a string class name of one of its implementations.
     *
     * @param parts
     *  the parts of the message
     *
     * @returns {string}
     */
    outcome(outcome: Outcome, ...parts: any[]): string {
        return this.joined(parts);
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
        return this.repeat(pattern);
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
        return this.joined(parts);
    }
}
