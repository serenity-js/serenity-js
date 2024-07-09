import type { Outcome } from '@serenity-js/core/lib/model';

import { TerminalTheme } from './TerminalTheme';

/**
 * A simple colour theme for terminals with no colour support.
 */
export class ThemeForMonochromaticTerminals extends TerminalTheme {

    /**
     * Formats the heading
     *
     * @param parts
     *  `parts` to be converted to string, joined together, and formatted as a heading
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
     *  an instance of an `Outcome`
     *  or a string class name of one of its implementations.
     *
     * @param parts
     *  the parts of the message
     */
    outcome(outcome: Outcome, ...parts: any[]): string {
        return this.joined(parts);
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
