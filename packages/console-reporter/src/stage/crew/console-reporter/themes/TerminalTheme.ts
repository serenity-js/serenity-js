import type { Outcome } from '@serenity-js/core/lib/model';

/**
 * Decorates text with control characters to make the terminal
 * print output in colour.
 */
export abstract class TerminalTheme {
    abstract heading(...parts: any[]): string;
    abstract outcome(outcome: Outcome | string, ...parts: any[]): string;
    abstract separator(pattern: string): string;
    abstract log(...parts: any[]): string;

    /**
     * Converts the `parts` to `string` and joins them together.
     */
    protected joined(parts: any[]): string {
        return parts.map(String).join('');
    }

    /**
     * Repeats a given `pattern` so that it takes up to `maxLength` characters.
     * Used to produce separator lines.
     */
    protected repeat(pattern: string, maxLength = 80): string {
        if (! pattern) {
            return '';
        }

        const repetitions = Math.floor(maxLength / pattern.length);

        return pattern.repeat(repetitions);
    }
}
