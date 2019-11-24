import { Stage, StageCrewMember } from '@serenity-js/core';
import { AssertionError } from '@serenity-js/core/lib';
import {
    ActivityRelatedArtifactGenerated,
    DomainEvent,
    InteractionFinished,
    InteractionStarts,
    SceneFinished,
    SceneStarts,
    TaskFinished,
    TaskStarts,
    TestRunFinished,
} from '@serenity-js/core/lib/events';
import {
    ActivityDetails,
    AssertionReport,
    Duration,
    ExecutionCompromised,
    ExecutionFailedWithAssertionError,
    ExecutionFailedWithError,
    ExecutionIgnored,
    ExecutionSkipped,
    ExecutionSuccessful,
    ImplementationPending,
    LogEntry,
    Name,
    Outcome,
    ProblemIndication,
    Timestamp,
} from '@serenity-js/core/lib/model';
import { Instance as ChalkInstance } from 'chalk';
import { match } from 'tiny-types';
import { Printer } from './Printer';
import { Summary } from './Summary';
import { SummaryFormatter } from './SummaryFormatter';
import { TerminalTheme, ThemeForDarkTerminals, ThemeForLightTerminals, ThemeForMonochromaticTerminals } from './themes';

/**
 * @public
 */
export class ConsoleReporter implements StageCrewMember {

    private startTimes = new StartTimes();
    private artifacts = new ActivityRelatedArtifacts();
    private summary = new Summary();
    private firstError: FirstError = new FirstError();
    private readonly summaryFormatter: SummaryFormatter;

    static withDefaultColourSupport() {
        return new ConsoleReporter(
            new Printer(process.stdout),
            new ThemeForDarkTerminals(new ChalkInstance(/* auto-detect */)),
        );
    }

    static forMonochromaticTerminals() {
        return new ConsoleReporter(
            new Printer(process.stdout),
            new ThemeForMonochromaticTerminals(),
        );
    }

    static forDarkTerminals() {
        return new ConsoleReporter(
            new Printer(process.stdout),
            new ThemeForDarkTerminals(new ChalkInstance({ level: 2 })),
        );
    }

    static forLightTerminals() {
        return new ConsoleReporter(
            new Printer(process.stdout),
            new ThemeForLightTerminals(new ChalkInstance({ level: 2 })),
        );
    }

    constructor(
        private readonly printer: Printer,
        private readonly theme: TerminalTheme,
        private readonly stage: Stage = null,
    ) {
        this.summaryFormatter = new SummaryFormatter(this.theme);
    }

    assignedTo(stage: Stage) {
        return new ConsoleReporter(this.printer, this.theme, stage);
    }

    notifyOf(event: DomainEvent): void {
        match(event)
            .when(SceneStarts, (e: SceneStarts) => {

                this.firstError = new FirstError();
                this.startTimes.recordStartOf(e);

                // Print scenario header
                this.printer.println(this.theme.separator('-'));
                this.printer.println(e.value.location.path.value, e.value.location.line ? `:${ e.value.location.line }` : '');
                this.printer.println();
                this.printer.println(this.theme.heading(e.value.category.value, ': ', e.value.name.value));
                this.printer.println();

            })
            .when(TaskStarts, (e: TaskStarts) => {

                this.printer.indent();

                if (! this.firstError.alreadyRecorded()) {
                    this.printer.println(e.value.name.value);
                }

            })
            .when(InteractionStarts, (e: InteractionStarts) => {

                this.startTimes.recordStartOf(e);

            })
            .when(InteractionFinished, (e: InteractionFinished) => {

                this.printer.indent();
                this.printer.println(this.formattedOutcome(e));

                this.printer.indent();

                if (e.outcome instanceof ProblemIndication) {
                    this.firstError.recordIfNeeded(e.outcome.error);

                    if (! (e.outcome.error instanceof AssertionError)) {
                        this.printer.println(this.theme.outcome(e.outcome, e.outcome.error.toString()));
                    }
                }

                const artifacts = this.artifacts.recordedFor(e.value);

                if (artifacts.filter(a => a instanceof AssertionReport || a instanceof LogEntry).length > 0) {
                    this.printer.println();
                }

                artifacts.forEach(evt => {
                    if (evt.artifact instanceof AssertionReport) {
                        const details = evt.artifact.map((artifactContents: { expected: string, actual: string }) =>
                            this.theme.diff(artifactContents.expected, artifactContents.actual),
                        );

                        this.printer.println();
                        this.printer.println('Difference:');

                        this.printer.indent();
                        this.printer.println(details);
                        this.printer.outdent();

                        this.printer.println();
                    }

                    if (evt.artifact instanceof LogEntry) {
                        const details = evt.artifact.map((artifactContents: { data: string }) => artifactContents.data);

                        if (evt.name.value !== details) {
                            this.printer.println(this.theme.log(evt.name.value, ':'));
                        }

                        this.printer.println(details);
                        this.printer.println();
                    }
                });

                this.printer.outdent();

                this.printer.outdent();

            })
            .when(ActivityRelatedArtifactGenerated, (e: ActivityRelatedArtifactGenerated) => {

                this.artifacts.record(e);

            })
            .when(TaskFinished, (e: TaskFinished) => {

                this.printer.outdent();

                if (e.outcome instanceof ProblemIndication) {
                    this.printer.indent();
                    this.printer.indent();

                    if (! this.firstError.alreadyRecorded()) {
                        this.printer.println(this.theme.outcome(e.outcome, this.iconFrom(e.outcome), e.outcome.error.toString()));
                    }

                    this.printer.outdent();
                    this.printer.outdent();

                    this.firstError.recordIfNeeded(e.outcome.error);
                }

                else if (! (e.outcome instanceof ExecutionSuccessful)) {
                    this.printer.indent();
                    this.printer.println(this.iconFrom(e.outcome), e.value.name.value);

                    this.printer.outdent();
                }

            })
            .when(SceneFinished, (e: SceneFinished) => {

                this.summary.record(e.value, e.outcome, this.startTimes.eventDurationOf(e));

                this.printer.println();
                this.printer.println(this.theme.outcome(e.outcome, this.formattedOutcome(e, this.deCamelCased(e.outcome.constructor.name))));

                if (e.outcome instanceof ProblemIndication) {

                    this.printer.println();
                    this.printer.indent();

                    this.printer.println(e.outcome.error.stack);

                    this.printer.outdent();
                }

            })
            .when(TestRunFinished, (e: TestRunFinished) => {
                this.printer.println(this.theme.separator('='));

                this.printer.print(this.summaryFormatter.format(this.summary.aggregated()));

                this.printer.println(this.theme.separator('='));
            })
            .else((e: DomainEvent) => {
                return void 0;
            });
    }

    private formattedOutcome(event: IdentifiableEvent & { outcome: Outcome }, description: string = event.value.name.value) {
        const
            icon = `${ this.iconFrom(event.outcome) }`,
            message = `${ description } (${ this.startTimes.eventDurationOf(event) })`;

        return (event.outcome instanceof ProblemIndication)
            ? this.theme.outcome(event.outcome, `${icon}${message}`)
            : `${ this.theme.outcome(event.outcome, icon) }${ message }`;
    }

    private deCamelCased(name: string) {
        const deCamelCased = name.replace(/([^A-Z])([A-Z])/g, '$1 $2');

        return deCamelCased.charAt(0).toUpperCase() + deCamelCased.slice(1).toLocaleLowerCase();
    }

    private iconFrom(outcome: Outcome): string {
        switch (outcome.constructor) {
            case ExecutionCompromised:
            case ExecutionFailedWithError:
            case ExecutionFailedWithAssertionError:
                return '✗ ';
            case ImplementationPending:
                return '☕';
            case ExecutionSkipped:
                return '⇢ ';
            case ExecutionIgnored:
                return '? ';
            case ExecutionSuccessful:
                return '✓ ';
            default:
                return '';
        }
    }
}

interface IdentifiableEvent {
    value: { name: Name, toString(): string };
    timestamp: Timestamp;
}

class StartTimes {
    private times: { [correlationId: string]: Timestamp } = {};

    recordStartOf(event: IdentifiableEvent) {
        this.times[event.value.toString()] = event.timestamp;
    }

    eventDurationOf(event: IdentifiableEvent & { outcome: Outcome }): Duration {
        return event.timestamp.diff(this.times[event.value.toString()]);
    }
}

class FirstError {
    private error: Error;

    recordIfNeeded(error: Error) {
        if (! this.error) {
            this.error = error;
        }
    }

    alreadyRecorded(): boolean {
        return !! this.error;
    }

    get(): Error {
        return this.error;
    }
}

class ActivityRelatedArtifacts {

    private readonly events: ActivityRelatedArtifactGenerated[] = [];

    record(event: ActivityRelatedArtifactGenerated) {
        this.events.push(event);
    }

    recordedFor(details: ActivityDetails): ActivityRelatedArtifactGenerated[] {
        return this.events
            .filter(event => event.details.equals(details));
    }
}
