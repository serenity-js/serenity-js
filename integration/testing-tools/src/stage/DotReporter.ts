import { Stage, StageCrewMember } from '@serenity-js/core';
import { DomainEvent, SceneFinished, TestRunFinished, TestRunStarts } from '@serenity-js/core/events';
import type { Outcome, ScenarioDetails } from '@serenity-js/core/model';
import {
    ExecutionSkipped,
    ExecutionSuccessful,
    ImplementationPending,
    ProblemIndication,
} from '@serenity-js/core/model';

/**
 * A {@link StageCrewMember} that produces dot-matrix progress output,
 * matching the format of Mocha's built-in `dot` reporter.
 *
 * Prints `.` for passing, `,` for pending/skipped, and `!` for failing tests,
 * followed by a summary epilogue with pass/pending/fail counts and a failure list.
 *
 * @package
 */
export class DotReporter implements StageCrewMember {

    private stage: Stage;

    private n = -1;
    private readonly width: number;

    private runStartTimestamp: number | undefined;

    private passes = 0;
    private pending = 0;
    private failures: Array<{ details: ScenarioDetails; outcome: ProblemIndication }> = [];

    private readonly useColours: boolean;

    constructor() {
        const columns = typeof process !== 'undefined' && process.stdout && typeof process.stdout.columns === 'number'
            ? process.stdout.columns
            : 75;
        this.width = (columns * 0.75) | 0;
        this.useColours = typeof process !== 'undefined'
            && !! process.stdout?.isTTY;
    }

    assignedTo(stage: Stage): StageCrewMember {
        this.stage = stage;
        return this;
    }

    notifyOf(event: DomainEvent): void {
        if (event instanceof TestRunStarts) {
            this.runStartTimestamp = event.timestamp.value.getTime();
            process.stdout.write('\n');
        }

        else if (event instanceof SceneFinished) {
            this.printDot(event.details, event.outcome);
        }

        else if (event instanceof TestRunFinished) {
            this.epilogue();
        }
    }

    private printDot(details: ScenarioDetails, outcome: Outcome): void {
        this.n++;

        const prefix = this.n % this.width === 0
            ? '\n  '
            : '';

        if (outcome instanceof ExecutionSuccessful) {
            this.passes++;
            process.stdout.write(prefix + this.colour('fast', '.'));
        }

        else if (outcome instanceof ImplementationPending || outcome instanceof ExecutionSkipped) {
            this.pending++;
            process.stdout.write(prefix + this.colour('pending', ','));
        }

        else if (outcome instanceof ProblemIndication) {
            this.failures.push({ details, outcome });
            process.stdout.write(prefix + this.colour('fail', '!'));
        }

        else {
            this.pending++;
            process.stdout.write(prefix + this.colour('pending', ','));
        }
    }

    private epilogue(): void {
        process.stdout.write('\n');

        const duration = this.runStartTimestamp
            ? this.formatDuration(Date.now() - this.runStartTimestamp)
            : '0ms';

        // blank line
        console.log();

        // passing
        console.log(
            ' %s %s %s',
            this.colour('bright pass', ' '),
            this.colour('green', `${ this.passes } passing`),
            this.colour('light', `(${ duration })`),
        );

        // pending
        if (this.pending > 0) {
            console.log(
                ' %s %s',
                this.colour('pending', ' '),
                this.colour('pending', `${ this.pending } pending`),
            );
        }

        // failing
        if (this.failures.length > 0) {
            console.log(this.colour('fail', `  ${ this.failures.length } failing`));

            console.log();
            this.listFailures();
            console.log();
        }

        console.log();
    }

    private listFailures(): void {
        for (let i = 0; i < this.failures.length; i++) {
            const { details, outcome } = this.failures[i];

            const title = details.category.value !== details.name.value
                ? `${ details.category.value }\n       ${ details.name.value }`
                : details.name.value;

            const message = outcome.error.message || '';
            const stack = this.formatStack(outcome.error.stack || '', message);

            console.log(
                '  %s) %s:',
                this.colour('error title', String(i + 1)),
                this.colour('error title', title),
            );
            console.log(
                '     %s',
                this.colour('error message', message),
            );
            if (stack) {
                console.log(this.colour('error stack', '%s'), stack);
            }
        }
    }

    private formatStack(stack: string, message: string): string {
        // Remove the error message from the stack trace (it's printed separately)
        const messageIndex = stack.indexOf(message);
        const traceStart = messageIndex >= 0
            ? messageIndex + message.length
            : 0;

        const traceOnly = stack.slice(traceStart).replace(/^\n/, '');
        if (!traceOnly.trim()) {
            return '';
        }

        return traceOnly
            .split('\n')
            .map(line => '  ' + line)
            .join('\n');
    }

    private formatDuration(ms: number): string {
        if (ms >= 60_000) {
            const m = Math.floor(ms / 60_000);
            const s = Math.round((ms % 60_000) / 1000);
            return s > 0 ? `${ m }m ${ s }s` : `${ m }m`;
        }
        if (ms >= 1000) {
            const s = Math.round(ms / 1000);
            return `${ s }s`;
        }
        return `${ ms }ms`;
    }

    // ANSI colour codes matching Mocha's Base.colors
    private static readonly colours: Record<string, string> = {
        'fast':          '90',      // grey
        'medium':        '33',      // yellow
        'bright yellow': '93',      // bright yellow
        'pending':       '36',      // cyan
        'fail':          '31',      // red
        'bright pass':   '92',      // bright green
        'green':         '32',      // green
        'light':         '90',      // grey
        'error title':   '0',       // default
        'error message': '31',      // red
        'error stack':   '90',      // grey
    };

    private colour(type: string, text: string): string {
        if (!this.useColours) {
            return text;
        }

        const code = DotReporter.colours[type] || '0';
        return `\x1b[${ code }m${ text }\x1b[0m`;
    }
}
