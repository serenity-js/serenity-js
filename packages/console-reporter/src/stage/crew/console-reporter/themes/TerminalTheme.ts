import { Outcome } from '@serenity-js/core/lib/model';

/**
 * @desc
 *  Decorates text with control characters to make the terminal
 *  print output in colour.
 *
 * @public
 * @abstract
 */
export abstract class TerminalTheme {
    abstract heading(...parts: any[]): string;
    abstract outcome(outcome: Outcome | string, ...parts: any[]): string;
    abstract separator(pattern: string): string;
    abstract log(...parts: any[]): string;

    /**
     * @desc
     *  Converts the `parts` to `string` and joins them together.
     *
     * @protected
     *
     * @param {any[]} parts
     *
     * @returns {string}
     */
    protected joined(parts: any[]): string {
        return parts.map(String).join('');
    }

    /**
     * @desc
     *  Repeats a given `pattern` so that it takes up to `maxLength` characters.
     *  Used to produce separator lines.
     *
     * @protected
     *
     * @param {string} pattern
     * @param {number} [maxLength=80] maxLength
     *
     * @returns {string}
     */
    protected repeat(pattern: string, maxLength = 80): string {
        if (! pattern) {
            return '';
        }

        const repetitions = Math.floor(maxLength / pattern.length);

        return pattern.repeat(repetitions);
    }
}
