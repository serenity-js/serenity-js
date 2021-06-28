import { ListensToDomainEvents, Stage, StageCrewMemberBuilder } from '@serenity-js/core';
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
import { OutputStream } from '@serenity-js/core/lib/io';
import {
    AssertionReport,
    CorrelationId,
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
import { Instance as ChalkInstance } from 'chalk';  // eslint-disable-line unicorn/import-style
import { ensure, isDefined, match } from 'tiny-types';

import { Printer } from './Printer';
import { Summary } from './Summary';
import { SummaryFormatter } from './SummaryFormatter';
import { TerminalTheme, ThemeForDarkTerminals, ThemeForLightTerminals, ThemeForMonochromaticTerminals } from './themes';

/**
 * @desc
 *  Uses [standard output](https://en.wikipedia.org/wiki/Standard_streams)
 *  to report on progress of your Serenity/JS acceptance tests.
 *
 *  `ConsoleReporter` ships with colour themes for both dark and light terminals,
 *  as well as a monochromatic theme for those moments when you're in a noir mood
 *  (or have a terminal that doesn't support colours, like the good old `cmd.exe` on Windows).
 *
 * @example <caption>Registering the reporter programmatically</caption>
 *  import { configure } from '@serenity-js/core';
 *  import { ConsoleReporter } from '@serenity-js/console-reporter';
 *
 *  configure({
 *      crew: [ ConsoleReporter.withDefaultColourSupport() ],
 *  });
 *
 * @example <caption>Redirecting output to a file</caption>
 *  import { configure } from '@serenity-js/core';
 *  import { ConsoleReporter } from '@serenity-js/console-reporter';
 *  import { createWriteStream } from 'fs';
 *
 *  configure({
 *      outputStream: createWriteStream('./output.log'),
 *      crew: [ ConsoleReporter.withDefaultColourSupport() ],
 *  });
 *
 * @example <caption>Registering the reporter using Protractor configuration</caption>
 *  // protractor.conf.js
 *  const { ConsoleReporter } = require('@serenity-js/console-reporter');
 *
 *  exports.config = {
 *    framework:     'custom',
 *    frameworkPath: require.resolve('@serenity-js/protractor/adapter'),
 *
 *    serenity: {
 *      crew: [
 *        ConsoleReporter.withDefaultColourSupport(),
 *      ],
 *      // other Serenity/JS config
 *    },
 *
 *    // other Protractor config
 *  };
 *
 * @public
 * @implements {@serenity-js/core/lib/stage~ListensToDomainEvents}
 */
export class ConsoleReporter implements ListensToDomainEvents {

    private startTimes = new StartTimes();
    private artifacts = new ActivityRelatedArtifacts();
    private summary = new Summary();
    private firstError: FirstError = new FirstError();
    private readonly summaryFormatter: SummaryFormatter;

    /**
     * @desc
     *  Instantiates a `ConsoleReporter` that auto-detects
     *  your terminal's support for colours and use a colour theme
     *  for dark terminals if successful.
     *
     *  Please note that spawning your test process from another process
     *  (by using [npm-failsafe](https://www.npmjs.com/package/npm-failsafe), for example)
     *  causes the `ConsoleReporter` to use the monochromatic colour scheme,
     *  as colour support can't be detected in child processes.
     *
     *  If the above describes your setup, use {@link ConsoleReporter#forDarkTerminals}
     *  or {@link ConsoleReporter#forLightTerminals} to make the sub-process produce colour output.
     *
     * @returns {@serenity-js/core/lib/stage~StageCrewMemberBuilder}
     */
    static withDefaultColourSupport(): StageCrewMemberBuilder<ConsoleReporter> {
        return new ConsoleReporterBuilder(new ThemeForDarkTerminals(new ChalkInstance(/* auto-detect */)));
    }

    /**
     * @desc
     *  Instantiates a `ConsoleReporter` with a monochromatic colour theme.
     *  Good for terminals with no colour support (like the `cmd.exe` on Windows),
     *  or for when you need to pipe the output to a text file and want
     *  to avoid printing control characters.
     *
     * @returns {@serenity-js/core/lib/stage~StageCrewMemberBuilder}
     */
    static forMonochromaticTerminals(): StageCrewMemberBuilder<ConsoleReporter> {
        return new ConsoleReporterBuilder(new ThemeForMonochromaticTerminals());
    }

    /**
     * @desc
     *  Instantiates a `ConsoleReporter` with a colour theme optimised for terminals with dark backgrounds.
     *
     * @returns {@serenity-js/core/lib/stage~StageCrewMemberBuilder}
     */
    static forDarkTerminals(): StageCrewMemberBuilder<ConsoleReporter> {
        return new ConsoleReporterBuilder(new ThemeForDarkTerminals(new ChalkInstance({ level: 2 })));
    }

    /**
     * @desc
     *  Instantiates a `ConsoleReporter` with a colour theme optimised for terminals with light backgrounds.
     *
     * @returns {@serenity-js/core/lib/stage~StageCrewMemberBuilder}
     */
    static forLightTerminals(): StageCrewMemberBuilder<ConsoleReporter> {
        return new ConsoleReporterBuilder(new ThemeForLightTerminals(new ChalkInstance({ level: 2 })));
    }

    /**
     * @param {Printer} printer
     * @param {TerminalTheme} theme
     * @param {@serenity-js/core/lib/stage~Stage} [stage=null]
     */
    constructor(
        private readonly printer: Printer,
        private readonly theme: TerminalTheme,
        private readonly stage?: Stage,
    ) {
        ensure('printer', printer, isDefined());
        ensure('theme', theme, isDefined());

        this.summaryFormatter = new SummaryFormatter(this.theme);
    }

    /**
     * @desc
     *  Handles {@link @serenity-js/core/lib/events~DomainEvent} objects emitted by the {@link @serenity-js/core/lib/stage~StageCrewMember}.
     *
     * @see {@link @serenity-js/core/lib/stage~StageCrewMember}
     *
     * @listens {@serenity-js/core/lib/events~DomainEvent}
     *
     * @param {@serenity-js/core/lib/events~DomainEvent} event
     * @returns {void}
     */
    notifyOf(event: DomainEvent): void {
        match(event)
            .when(SceneStarts, (e: SceneStarts) => {

                this.firstError = new FirstError();
                this.startTimes.recordStartOf(e);

                // Print scenario header
                this.printer.println(this.theme.separator('-'));
                this.printer.println(e.details.location.path.value, e.details.location.line ? `:${ e.details.location.line }` : '');
                this.printer.println();
                this.printer.println(this.theme.heading(e.details.category.value, ': ', e.details.name.value));
                this.printer.println();
            })

        // todo: add SceneTagged ...

            .when(TaskStarts, (e: TaskStarts) => {

                this.printer.indent();

                if (! this.firstError.alreadyRecorded()) {
                    this.printer.println(e.details.name.value);
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
                        this.printer.println(this.theme.outcome(e.outcome, `${ e.outcome.error }`));
                    }
                }

                const artifactGeneratedEvents = this.artifacts.recordedFor(e.activityId);

                if (artifactGeneratedEvents.some(a => a instanceof AssertionReport || a instanceof LogEntry)) {
                    this.printer.println();
                }

                artifactGeneratedEvents.forEach(artifactGenerated => {
                    if (artifactGenerated.artifact instanceof AssertionReport) {
                        const details = artifactGenerated.artifact.map(
                            (artifactContents: { expected: string, actual: string }) =>
                                this.theme.diff(
                                    artifactContents.expected,
                                    artifactContents.actual,
                                ),
                        );

                        this.printer.println();

                        this.printer.println(details);

                        this.printer.println();
                    }

                    if (artifactGenerated.artifact instanceof LogEntry) {
                        const details = artifactGenerated.artifact.map((artifactContents: { data: string }) => artifactContents.data);

                        if (artifactGenerated.name.value !== details) {
                            this.printer.println(this.theme.log(artifactGenerated.name.value, ':'));
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
                        this.printer.println(this.theme.outcome(e.outcome, this.iconFrom(e.outcome), `${ e.outcome.error }`));
                    }

                    this.printer.outdent();
                    this.printer.outdent();

                    this.firstError.recordIfNeeded(e.outcome.error);
                }

                else if (! (e.outcome instanceof ExecutionSuccessful)) {
                    this.printer.indent();
                    this.printer.println(this.iconFrom(e.outcome), e.details.name.value);

                    this.printer.outdent();
                }

            })
            .when(SceneFinished, (e: SceneFinished) => {

                this.summary.record(e.details, e.outcome, this.startTimes.eventDurationOf(e));

                this.printer.println();
                this.printer.println(this.theme.outcome(e.outcome, this.formattedOutcome(e, this.deCamelCased(e.outcome.constructor.name))));

                if (e.outcome instanceof ProblemIndication) {

                    this.printer.println();

                    this.printer.indent();

                    if (e.outcome instanceof ImplementationPending) {
                        this.printer.println(`${ e.outcome.error.name }: ${ e.outcome.error.message }`);
                    } else if (e.outcome.error?.stack) {
                        this.printer.println(e.outcome.error.stack);
                    }

                    this.printer.outdent();
                }

                this.artifacts.clear();
            })
            .when(TestRunFinished, (_: TestRunFinished) => {
                this.printer.println(this.theme.separator('='));

                this.printer.print(this.summaryFormatter.format(this.summary.aggregated()));

                this.printer.println(this.theme.separator('='));
            })
            .else((_: DomainEvent) => {
                return void 0;
            });
    }

    private formattedOutcome(event: IdentifiableEvent & { outcome: Outcome }, description: string = event.details.name.value) {
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

class ConsoleReporterBuilder implements StageCrewMemberBuilder<ConsoleReporter> {
    constructor(private readonly theme: TerminalTheme) {
    }

    build({ stage, outputStream }: { stage: Stage; outputStream: OutputStream; }): ConsoleReporter {
        return new ConsoleReporter(new Printer(outputStream), this.theme, stage);
    }
}

interface IdentifiableEvent {
    details: { name: Name, toString(): string };
    timestamp: Timestamp;
}

class StartTimes {
    private times: { [correlationId: string]: Timestamp } = {};

    recordStartOf(event: IdentifiableEvent) {
        this.times[event.details.toString()] = event.timestamp;
    }

    eventDurationOf(event: IdentifiableEvent & { outcome: Outcome }): Duration {
        return event.timestamp.diff(this.times[event.details.toString()]);
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

    private events: ActivityRelatedArtifactGenerated[] = [];

    record(event: ActivityRelatedArtifactGenerated) {
        this.events.push(event);
    }

    recordedFor(activityId: CorrelationId): ActivityRelatedArtifactGenerated[] {
        return this.events
            .filter(event => event.activityId.equals(activityId));
    }

    clear() {
        this.events = [];
    }
}
