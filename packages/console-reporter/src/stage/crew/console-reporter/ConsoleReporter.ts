import type { Duration, ListensToDomainEvents, Stage, StageCrewMemberBuilder, Timestamp } from '@serenity-js/core';
import { AssertionError, d, DomainEventQueues, LogicError } from '@serenity-js/core';
import type { OutputStream } from '@serenity-js/core/lib/adapter';
import type {
    DomainEvent} from '@serenity-js/core/lib/events';
import {
    ActivityRelatedArtifactGenerated,
    InteractionFinished,
    InteractionStarts,
    SceneFinished,
    SceneStarts,
    TaskFinished,
    TaskStarts,
    TestRunFinished,
    TestRunStarts,
} from '@serenity-js/core/lib/events';
import type {
    CorrelationId,
    Name,
    Outcome} from '@serenity-js/core/lib/model';
import {
    ExecutionCompromised,
    ExecutionFailedWithAssertionError,
    ExecutionFailedWithError,
    ExecutionIgnored,
    ExecutionSkipped,
    ExecutionSuccessful,
    ImplementationPending,
    LogEntry,
    ProblemIndication,
} from '@serenity-js/core/lib/model';
import { Instance as ChalkInstance } from 'chalk'; // eslint-disable-line unicorn/import-style
import { ensure, isDefined, match } from 'tiny-types';

import type { ConsoleReporterConfig } from './ConsoleReporterConfig';
import { Printer } from './Printer';
import { Summary } from './Summary';
import { SummaryFormatter } from './SummaryFormatter';
import type { TerminalTheme} from './themes';
import { ThemeForDarkTerminals, ThemeForLightTerminals, ThemeForMonochromaticTerminals } from './themes';

/**
 * A [`StageCrewMember`](https://serenity-js.org/api/core/interface/StageCrewMember/) that uses [standard output](https://en.wikipedia.org/wiki/Standard_streams)
 * to report on progress of your Serenity/JS acceptance tests.
 *
 * `ConsoleReporter` ships with colour themes for both dark and light terminals,
 * as well as a monochromatic theme for those moments when you're in a noir mood
 * (or have a terminal that doesn't support colours, like the good old `cmd.exe` on Windows).
 *
 * ## Registering Console Reporter programmatically
 *
 * ```ts
 *  import { configure } from '@serenity-js/core';
 *  import { ConsoleReporter } from '@serenity-js/console-reporter';
 *
 *  configure({
 *    crew: [
 *      ConsoleReporter.withDefaultColourSupport()
 *    ],
 *  });
 * ```
 *
 * ## Redirecting output to a file
 *
 * ```ts
 *  import { configure } from '@serenity-js/core';
 *  import { ConsoleReporter } from '@serenity-js/console-reporter';
 *  import { createWriteStream } from 'fs';
 *
 *  configure({
 *    outputStream: createWriteStream('./output.log'),
 *    crew: [ ConsoleReporter.withDefaultColourSupport() ],
 *  });
 *  ```
 *
 * ## Registering Console Reporter with Playwright Test
 *
 * ```ts
 * // playwright.config.ts
 * import { devices } from '@playwright/test';
 * import type { PlaywrightTestConfig } from '@serenity-js/playwright-test';
 *
 * const config: PlaywrightTestConfig = {
 *
 *   reporter: [
 *     [ 'line' ],
 *     [ 'html', { open: 'never' } ],
 *     [ '@serenity-js/playwright-test', {
 *       crew: [
 *         '@serenity-js/console-reporter',
 *       ]
 *     }]
 *   ],
 * }
 * ```
 *
 * ## Registering Console Reporter with WebdriverIO
 *
 * ```ts
 * // wdio.conf.ts
 * import { ConsoleReporter } from '@serenity-js/console-reporter';
 * import { WebdriverIOConfig } from '@serenity-js/webdriverio';
 *
 * export const config: WebdriverIOConfig = {
 *
 *   framework: '@serenity-js/webdriverio',
 *
 *   serenity: {
 *     crew: [
 *       '@serenity-js/console-reporter',
 *     ]
 *     // other Serenity/JS config
 *   },
 *
 *  // other WebdriverIO config
 * }
 * ```
 *
 * ## Registering Console Reporter with Protractor
 *
 * ```js
 * // protractor.conf.js
 * const { ConsoleReporter } = require('@serenity-js/console-reporter');
 *
 * exports.config = {
 *   framework:     'custom',
 *   frameworkPath: require.resolve('@serenity-js/protractor/adapter'),
 *
 *   serenity: {
 *     crew: [
 *       '@serenity-js/console-reporter',
 *     ],
 *     // other Serenity/JS config
 *   },
 *
 *   // other Protractor config
 * }
 * ```
 *
 * ## Changing the default colour theme
 *
 * ```js
 *   // ...
 *   serenity: {
 *     crew: [
 *       [ '@serenity-js/console-reporter', {
 *         theme: 'light',
 *         // theme: 'dark',
 *         // theme: 'mono',
 *         // theme: 'auto',
 *       } ]
 *     ],
 *   },
 *   //...
 * ```
 *
 * @public
 *
 * @group Stage
 */
export class ConsoleReporter implements ListensToDomainEvents {

    private startTimes = new StartTimes();
    private artifacts = new ActivityRelatedArtifacts();
    private summary = new Summary();
    private readonly firstErrors: Map<string, FirstError> = new Map();
    private readonly summaryFormatter: SummaryFormatter;
    private readonly eventQueues = new DomainEventQueues();

    static fromJSON(config: ConsoleReporterConfig): StageCrewMemberBuilder<ConsoleReporter> {
        return new ConsoleReporterBuilder(ConsoleReporter.theme(config.theme));
    }

    /**
     * Instantiates a `ConsoleReporter` that auto-detects
     * your terminal's support for colours and uses a colour theme
     * for dark terminals if successful.
     *
     * Please note that spawning your test process from another process
     * (by using [npm-failsafe](https://www.npmjs.com/package/npm-failsafe), for example)
     * causes the `ConsoleReporter` to use the monochromatic colour scheme,
     * as colour support can't be detected in child processes.
     */
    static withDefaultColourSupport(): StageCrewMemberBuilder<ConsoleReporter> {
        return new ConsoleReporterBuilder(ConsoleReporter.theme('auto'));
    }

    /**
     * Instantiates a `ConsoleReporter` with a monochromatic colour theme.
     * Good for terminals with no colour support (like the `cmd.exe` on Windows),
     * or for times when you need to pipe the output to a text file and want
     * to avoid printing control characters.
     */
    static forMonochromaticTerminals(): StageCrewMemberBuilder<ConsoleReporter> {
        return new ConsoleReporterBuilder(ConsoleReporter.theme('mono'));
    }

    /**
     * Instantiates a `ConsoleReporter` with a colour theme optimised for terminals with dark backgrounds.
     */
    static forDarkTerminals(): StageCrewMemberBuilder<ConsoleReporter> {
        return new ConsoleReporterBuilder(ConsoleReporter.theme('dark'));
    }

    /**
     * Instantiates a `ConsoleReporter` with a colour theme optimised for terminals with light backgrounds.
     */
    static forLightTerminals(): StageCrewMemberBuilder<ConsoleReporter> {
        return new ConsoleReporterBuilder(ConsoleReporter.theme('light'));
    }

    private static theme(theme: 'light' | 'dark' | 'mono' | 'auto') {
        switch (theme) {
            case 'dark':
                return new ThemeForDarkTerminals(new ChalkInstance({ level: 2 }));
            case 'light':
                return new ThemeForLightTerminals(new ChalkInstance({ level: 2 }));
            case 'mono':
                return new ThemeForMonochromaticTerminals();
            default:
                return new ThemeForDarkTerminals(new ChalkInstance(/* auto-detect */));
        }
    }

    /**
     * @param {Printer} printer
     * @param {TerminalTheme} theme
     * @param {Stage} [stage=undefined]
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
     * Handles [`DomainEvent`](https://serenity-js.org/api/core-events/class/DomainEvent/) objects emitted by the [`Stage`](https://serenity-js.org/api/core/class/Stage/).
     *
     * @see [`StageCrewMember`](https://serenity-js.org/api/core/interface/StageCrewMember/)
     *
     * @listens {DomainEvent}
     *
     * @param {DomainEvent} event
     */
    notifyOf(event: DomainEvent): void {

        if (event instanceof TestRunStarts) {
            this.summary.recordTestRunStartedAt(event.timestamp);
        }

        if (this.isSceneSpecific(event)) {
            this.eventQueues.enqueue(event);
        }

        if (event instanceof SceneStarts) {
            this.firstErrors.set(event.sceneId.value, new FirstError());

            this.startTimes.recordStartOf(event);
        }

        if (event instanceof SceneFinished) {
            this.printScene(event.sceneId);
        }

        if (event instanceof TestRunFinished) {
            this.summary.recordTestRunFinishedAt(event.timestamp);

            this.printSummary(this.summary);

            if (event.outcome instanceof ProblemIndication) {
                this.printTestRunErrorOutcome(event.outcome);
            }
        }
    }

    private printTestRunErrorOutcome(outcome: ProblemIndication): void {
        this.printer.println(this.theme.outcome(outcome, outcome.error.stack));
    }

    private printScene(sceneId: CorrelationId): void {
        const events = this.eventQueues.drainQueueFor(sceneId);

        for (const event of events) {
            match(event)
                .when(SceneStarts, (e: SceneStarts) => {

                    const category = e.details.name.value ? `${ e.details.category.value }: ` : '';

                    // Print scenario header
                    this.printer.println(this.theme.separator('-'));
                    this.printer.println(e.details.location.path.value, e.details.location.line ? `:${ e.details.location.line }` : '');
                    this.printer.println();
                    this.printer.println(this.theme.heading(category, e.details.name.value));
                    this.printer.println();
                })

                .when(TaskStarts, (e: TaskStarts) => {

                    this.printer.indent();

                    if (! this.firstErrors.get(e.sceneId.value)?.alreadyRecorded()) {
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
                        this.firstErrors.get(e.sceneId.value)?.recordIfNeeded(e.outcome.error);

                        if (! (e.outcome.error instanceof AssertionError)) {
                            this.printer.println(this.theme.outcome(e.outcome, `${ e.outcome.error }`));
                        }
                    }

                    const artifactGeneratedEvents = this.artifacts.recordedFor(e.activityId);

                    if (artifactGeneratedEvents.some(a => a instanceof LogEntry)) {
                        this.printer.println();
                    }

                    artifactGeneratedEvents.forEach(artifactGenerated => {
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

                        if (! this.firstErrors.get(e.sceneId.value).alreadyRecorded()) {
                            this.printer.println(this.theme.outcome(e.outcome, this.iconFrom(e.outcome), `${ e.outcome.error }`));
                        }

                        this.printer.outdent();
                        this.printer.outdent();

                        this.firstErrors.get(e.sceneId.value).recordIfNeeded(e.outcome.error);
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
                .else((_: DomainEvent) => {
                    return void 0;
                });
        }
    }

    private printSummary(summary: Summary) {
        this.printer.println(this.theme.separator('='));

        this.printer.print(this.summaryFormatter.format(summary.aggregated()));

        this.printer.println(this.theme.separator('='));
    }

    private isSceneSpecific(event: DomainEvent): event is DomainEvent & { sceneId: CorrelationId } {
        return Object.prototype.hasOwnProperty.call(event, 'sceneId');
    }

    private formattedOutcome(event: IdentifiableEvent & { outcome: Outcome }, description: string = event.details.name.value) {
        const duration  = this.startTimes.eventDurationOf(event);
        const icon      = this.iconFrom(event.outcome);
        const message   = description.split('\n').map((line, index) =>
            index === 0
                ? `${ line } (${ duration })`
                : `${ ' '.repeat(icon.length) }${ line }`
        ).join('\n');

        return (event.outcome instanceof ProblemIndication)
            ? this.theme.outcome(event.outcome, `${icon}${message}`)
            : `${ this.theme.outcome(event.outcome, icon) }${ message }`;
    }

    private deCamelCased(name: string) {
        const deCamelCased = name.replaceAll(/([^A-Z])([A-Z])/g, '$1 $2');

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
    sceneId: CorrelationId;
    activityId?: CorrelationId;
    details: { name: Name, toString(): string };
    timestamp: Timestamp;
}

class StartTimes {
    private times: { [key: string]: Timestamp } = {};

    recordStartOf(event: IdentifiableEvent) {
        this.times[this.keyFor(event)] = event.timestamp;
    }

    eventDurationOf(event: IdentifiableEvent & { outcome: Outcome }): Duration {
        if (! this.times[this.keyFor(event)]) {
            throw new LogicError(d`StartTime missing for event ${ event }`)
        }

        return event.timestamp.diff(this.times[this.keyFor(event)]);
    }

    private keyFor(event: IdentifiableEvent): string {
        return `${ event.sceneId.toString() }:${ event.activityId?.toString() }`;
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
