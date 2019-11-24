import {
    ExecutionCompromised,
    ExecutionFailedWithAssertionError,
    ExecutionFailedWithError,
    ExecutionIgnored,
    ExecutionSkipped, ExecutionSuccessful,
    ImplementationPending, Outcome,
} from '@serenity-js/core/lib/model';

export abstract class TerminalTheme {
    abstract heading(...parts: any[]): string;
    abstract outcome(outcome: Outcome | string, ...parts: any[]): string;
    abstract separator(pattern: string): string;
    abstract diff(expected: string, actual: string): string;
    abstract log(...parts: any[]): string;

    protected joined(parts: any[]): string {
        return parts.map(String).join('');
    }

    protected repeat(pattern: string, maxLength = 80) {
        if (! pattern) {
            return '';
        }

        const repetitions = Math.floor(maxLength / pattern.length);

        return pattern.repeat(repetitions);
    }
}
