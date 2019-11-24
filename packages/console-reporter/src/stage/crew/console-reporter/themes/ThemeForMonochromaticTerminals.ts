import { Outcome } from '@serenity-js/core/lib/model';
import { TerminalTheme } from './TerminalTheme';

export class ThemeForMonochromaticTerminals extends TerminalTheme {
    heading(...parts: any[]): string {
        return this.joined(parts);
    }

    outcome(outcome: Outcome, ...parts: any[]): string {
        return this.joined(parts);
    }

    separator(pattern: string): string {
        return this.repeat(pattern);
    }

    diff(expected: string, actual: string): string {
        return `expected: ${ expected }\n\nactual: ${ actual}`;
    }

    log(...parts): string {
        return this.joined(parts);
    }
}
