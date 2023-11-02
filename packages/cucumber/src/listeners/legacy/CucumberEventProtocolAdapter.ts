import type { formatterHelpers as cucumberFormatterHelpers } from '@cucumber/cucumber';
import type { ITestCaseAttempt } from '@cucumber/cucumber/lib/formatter/helpers/event_data_collector';
import { isFailure, isWarning } from '@cucumber/cucumber/lib/formatter/helpers/index';
import * as messages from '@cucumber/messages';
import { RuntimeError } from '@serenity-js/core';
import { AssertionError, ErrorSerialiser, ImplementationPendingError, TestCompromisedError } from '@serenity-js/core/lib/errors';
import { FileSystemLocation, Path } from '@serenity-js/core/lib/io';
import type {
    Outcome} from '@serenity-js/core/lib/model';
import {
    ExecutionCompromised,
    ExecutionFailedWithAssertionError,
    ExecutionFailedWithError,
    ExecutionSkipped,
    ExecutionSuccessful,
    ImplementationPending,
    Name
} from '@serenity-js/core/lib/model';
import { ensure, isDefined } from 'tiny-types';

import { AmbiguousStepDefinitionError } from '../../errors';
import type { CucumberFormatterOptions } from './CucumberFormatterOptions';
import type { Dependencies } from './Dependencies';
import { Feature, Hook, Scenario, ScenarioOutline, Step } from './gherkin';

interface Location {
    uri: string;
    line: number;
}

interface StepLocations {
    actionLocation?: Location;
    sourceLocation?: Location;
}

/**
 * @private
 */
export function cucumberEventProtocolAdapter({ serenity, notifier, mapper, cache }: Dependencies) { // eslint-disable-line @typescript-eslint/explicit-module-boundary-types
    // see https://github.com/cucumber/cucumber-js/blob/842099b87b6d689c2a45f13c820fd382108346a8/src/formatter/index.ts
    return class CucumberEventProtocolAdapter {

        // note: exported class expression can't have private properties
        public uri?: string
        public lastRuleId?: string

        public readonly cwd: string
        public readonly eventDataCollector: any;
        public readonly log: (buffer: string | Uint8Array) => void;
        public readonly cleanup: () => Promise<any>;
        public readonly formatterHelpers: typeof cucumberFormatterHelpers;

        constructor({ cleanup, cwd, eventBroadcaster, eventDataCollector, formatterHelpers, log }: CucumberFormatterOptions) {
            this.log = log;
            this.cwd = cwd;
            this.eventDataCollector = eventDataCollector;
            this.cleanup = cleanup;
            this.formatterHelpers = formatterHelpers;

            // Cucumber Messages
            // eventBroadcaster.on('envelope', this.parseEnvelope.bind(this));

            eventBroadcaster.on('gherkin-document', ({ uri, document }) => {
                ensure('gherkin-document :: uri', uri, isDefined());
                ensure('gherkin-document :: document', document, isDefined());

                const path = new Path(uri);
                cache.set(path, mapper.map(document, path));    // eslint-disable-line unicorn/no-array-method-this-argument
            });

            eventBroadcaster.on('test-case-prepared', ({ steps, sourceLocation }: {
                steps: StepLocations[],
                sourceLocation: Location,
            }) => {
                ensure('test-case-prepared :: steps', steps, isDefined());
                ensure('test-case-prepared :: sourceLocation', sourceLocation, isDefined());

                const
                    path = new Path(sourceLocation.uri),
                    map = cache.get(path),
                    scenario = map.get(Scenario).onLine(sourceLocation.line);

                if (scenario.outline) {
                    const outline = map.get(ScenarioOutline).onLine(scenario.outline.line);

                    map.set(new ScenarioOutline(
                        outline.location,
                        outline.name,
                        outline.description,
                        outline.steps,
                        outline.parameters,
                    )).onLine(scenario.outline.line);
                }

                map.set(new Scenario(
                    scenario.location,
                    scenario.name,
                    scenario.description,
                    interleaveStepsAndHooks(scenario.steps, steps),
                    scenario.tags,
                    scenario.outline,
                )).onLine(sourceLocation.line);
            });

            eventBroadcaster.on('test-case-started', ({ sourceLocation }) => {
                ensure('test-case-started :: sourceLocation', sourceLocation, isDefined());

                const
                    map = cache.get(new Path(sourceLocation.uri)),
                    scenario = map.get(Scenario).onLine(sourceLocation.line),
                    sceneId = serenity.assignNewSceneId();

                if (scenario.outline) {
                    const outline = map.get(ScenarioOutline).onLine(scenario.outline.line);
                    notifier.outlineDetected(sceneId, scenario, outline, map.getFirst(Feature));
                }

                notifier.scenarioStarts(sceneId, scenario, map.getFirst(Feature));
            });

            eventBroadcaster.on('test-step-started', ({ index, testCase }) => {

                ensure('test-step-started :: index', index, isDefined());
                ensure('test-step-started :: testCase', testCase, isDefined());

                const
                    map      = cache.get(new Path(testCase.sourceLocation.uri)),
                    scenario = map.get(Scenario).onLine(testCase.sourceLocation.line),
                    step     = scenario.steps[index];

                if (step instanceof Step) { // ignore hooks
                    notifier.stepStarts(step);
                }
            });

            eventBroadcaster.on('test-step-finished', ({ index, result, testCase }) => {

                ensure('test-step-finished :: index', index, isDefined());
                ensure('test-step-finished :: result', result, isDefined());
                ensure('test-step-finished :: testCase', testCase, isDefined());

                const
                    map      = cache.get(new Path(testCase.sourceLocation.uri)),
                    scenario = map.get(Scenario).onLine(testCase.sourceLocation.line),
                    step     = scenario.steps[index];

                if (step instanceof Step) { // ignore hooks
                    notifier.stepFinished(step, this.outcomeFrom(result));
                }
            });

            eventBroadcaster.on('test-case-finished', ({ result, sourceLocation }) => {

                ensure('test-case-finished :: result', result, isDefined());
                ensure('test-case-finished :: sourceLocation', sourceLocation, isDefined());

                const
                    map             = cache.get(new Path(sourceLocation.uri)),
                    scenario        = map.get(Scenario).onLine(sourceLocation.line),
                    nonHookSteps    = scenario.steps.filter(step => step instanceof Step);

                const outcome: Outcome = nonHookSteps.length > 0
                    ? this.outcomeFrom(result)
                    : new ImplementationPending(new ImplementationPendingError(`"${ scenario.name.value }" has no test steps`));

                notifier.scenarioFinished(scenario, map.getFirst(Feature), outcome);
            });
        }

        async finished(): Promise<void> {
            await this.cleanup()
        }

        parseEnvelope(envelope: messages.Envelope) {
            if (envelope.testCaseStarted) {
                this.onTestCaseStarted(envelope.testCaseStarted)
            }
            if (envelope.testStepStarted) {
                this.onTestStepStarted(envelope.testStepStarted)
            }
            if (envelope.testStepFinished) {
                this.onTestStepFinished(envelope.testStepFinished)
            }
            if (envelope.testCaseFinished) {
                this.onTestCaseFinished(envelope.testCaseFinished)
            }
        }

        onTestCaseStarted(testCaseStarted: messages.TestCaseStarted) {
            const testCaseStartedId = testCaseStarted.id || '';

            // todo: extract
            const { gherkinDocument, pickle } = this.eventDataCollector.getTestCaseAttempt(testCaseStartedId)
            const { feature, uri } = gherkinDocument;
            const gherkinExampleRuleMap = this.formatterHelpers.GherkinDocumentParser.getGherkinExampleRuleMap(gherkinDocument);
            const gherkinScenarioMap = this.formatterHelpers.GherkinDocumentParser.getGherkinScenarioMap(gherkinDocument);
            if (!pickle.astNodeIds) {
                throw new Error('Pickle AST nodes missing');
            }
            // const pickleStepMap = this.formatterHelpers.PickleParser.getPickleStepMap(pickle)
            // const gherkinStepMap = this.formatterHelpers.GherkinDocumentParser.getGherkinStepMap(gherkinDocument)
            // const testStep = (testCase.testSteps || []).find(
            //     (item) => item.id === testStepStarted.testStepId
            // )
            const rule = gherkinExampleRuleMap[pickle.astNodeIds[0]];
            const scenarioMap = gherkinScenarioMap[pickle.astNodeIds[0]];
            // --- //

            // todo: review
            if (this.uri !== uri && feature) {
                this.uri = uri || ''
                this.lastRuleId = undefined
            }

            if (rule && rule.id !== this.lastRuleId) {
                this.lastRuleId = rule.id;
            }
            // --- //

            const path = new Path(uri);
            const map = mapper.map(gherkinDocument, path);  // eslint-disable-line unicorn/no-array-method-this-argument

            cache.set(path, map);

            const scenario = map.get(Scenario).onLine(scenarioMap.location.line);
            const sceneId = serenity.assignNewSceneId();

            if (scenarioMap.examples.length > 0) {
                const outline = map.get(ScenarioOutline).onLine(scenarioMap.location.line);    // todo: is the location right?
                notifier.outlineDetected(sceneId, scenario, outline, map.getFirst(Feature));
            }

            notifier.scenarioStarts(sceneId, scenario, map.getFirst(Feature));
        }

        onTestStepStarted(testStepStarted: messages.TestStepStarted) {
            const { gherkinDocument, pickle, testCase } =
                this.eventDataCollector.getTestCaseAttempt(
                    testStepStarted.testCaseStartedId || ''
                )

            // const gherkinScenarioMap = this.formatterHelpers.GherkinDocumentParser.getGherkinScenarioMap(gherkinDocument);
            const pickleStepMap = this.formatterHelpers.PickleParser.getPickleStepMap(pickle)
            const gherkinStepMap = this.formatterHelpers.GherkinDocumentParser.getGherkinStepMap(gherkinDocument)
            const testStep = (testCase.testSteps || []).find(item => item.id === testStepStarted.testStepId)

            if (testStep && testStep.pickleStepId) {
                const pickleStep = pickleStepMap[testStep.pickleStepId]
                const astNodeId = pickleStep.astNodeIds[0]
                const gherkinStep = gherkinStepMap[astNodeId]
                // this.logItem(ThemeItem.StepKeyword, gherkinStep.keyword)
                // this.log(' ')
                // this.logItem(ThemeItem.StepText, pickleStep.text)
                // this.newline()

                if (gherkinStep.docString) {
                    // this.logItem(
                    //     ThemeItem.DocStringDelimiter,
                    //     gherkinStep.docString.delimiter
                    // )
                    // this.newline()
                    // this.logItem(ThemeItem.DocStringContent, gherkinStep.docString.content)
                    // this.newline()
                    // this.logItem(
                    //     ThemeItem.DocStringDelimiter,
                    //     gherkinStep.docString.delimiter
                    // )
                    // this.newline()
                }

                if (gherkinStep.dataTable) {
                    // const datatable = new CliTable3(this.tableLayout)
                    // datatable.push(
                    //     ...gherkinStep.dataTable.rows.map((row: messages.TableRow) =>
                    //         (row.cells || []).map((cell) =>
                    //             this.styleItem(0, ThemeItem.DataTableContent, cell.value || '')
                    //         )
                    //     )
                    // )
                    // this.logItem(ThemeItem.DataTable, datatable.toString())
                    // this.newline()
                }

                // ensure('testStepStarted :: index', index, isDefined());
                // ensure('testStepStarted :: testCase', testCase, isDefined());

                // const
                //     map      = cache.get(new Path(pickle.uri)),
                //     scenario = map.get(Scenario).onLine(gherkinScenarioMap[pickle.astNodeIds[0]].location.line);
                // step     = scenario.steps[index];

                notifier.stepStarts(new Step(
                    new FileSystemLocation(
                        new Path(pickle.uri),
                        gherkinStep.location.line,
                        gherkinStep.location.column,
                    ),
                    new Name(gherkinStep.keyword + gherkinStep.text)
                ));
            }
        }

        onTestStepFinished(testStepFinished: messages.TestStepFinished) {
            const { message, status } = testStepFinished.testStepResult || {}

            // if (status && status !== Status.PASSED) {
            //     this.logItem(
            //         ThemeItem.StepStatus,
            //         this.colorFns.forStatus(status)(
            //             `${marks[status]} ${Status[status].toLowerCase()}`
            //         )
            //     )
            //     this.newline()
            //
            //     if (message) {
            //         this.logItem(ThemeItem.StepMessage, message)
            //         this.newline()
            //     }
            // }

            const { gherkinDocument, pickle, testCase, stepResults } =
                this.eventDataCollector.getTestCaseAttempt(
                    testStepFinished.testCaseStartedId || ''
                )

            // const gherkinScenarioMap = this.formatterHelpers.GherkinDocumentParser.getGherkinScenarioMap(gherkinDocument);
            const pickleStepMap = this.formatterHelpers.PickleParser.getPickleStepMap(pickle);
            const gherkinStepMap = this.formatterHelpers.GherkinDocumentParser.getGherkinStepMap(gherkinDocument);
            const testSteps = testCase.testSteps || [];
            const testStepIndex = testSteps.findIndex(item => item.id === testStepFinished.testStepId);
            const testStep = testSteps[testStepIndex];

            // const testStep = (testCase.testSteps || []).find(item => item.id === testStepFinished.testStepId)

            if (testStep && testStep.pickleStepId) {
                const pickleStep = pickleStepMap[testStep.pickleStepId]
                const astNodeId = pickleStep.astNodeIds[0]
                const gherkinStep = gherkinStepMap[astNodeId]
                // this.logItem(ThemeItem.StepKeyword, gherkinStep.keyword)
                // this.log(' ')
                // this.logItem(ThemeItem.StepText, pickleStep.text)
                // this.newline()

                if (gherkinStep.docString) {
                    // this.logItem(
                    //     ThemeItem.DocStringDelimiter,
                    //     gherkinStep.docString.delimiter
                    // )
                    // this.newline()
                    // this.logItem(ThemeItem.DocStringContent, gherkinStep.docString.content)
                    // this.newline()
                    // this.logItem(
                    //     ThemeItem.DocStringDelimiter,
                    //     gherkinStep.docString.delimiter
                    // )
                    // this.newline()
                }

                if (gherkinStep.dataTable) {
                    // const datatable = new CliTable3(this.tableLayout)
                    // datatable.push(
                    //     ...gherkinStep.dataTable.rows.map((row: messages.TableRow) =>
                    //         (row.cells || []).map((cell) =>
                    //             this.styleItem(0, ThemeItem.DataTableContent, cell.value || '')
                    //         )
                    //     )
                    // )
                    // this.logItem(ThemeItem.DataTable, datatable.toString())
                    // this.newline()
                }

                // ensure('testStepStarted :: index', index, isDefined());
                // ensure('testStepStarted :: testCase', testCase, isDefined());

                // const
                //     map      = cache.get(new Path(pickle.uri)),
                //     scenario = map.get(Scenario).onLine(gherkinScenarioMap[pickle.astNodeIds[0]].location.line);
                // step     = scenario.steps[index];

                const previousTestStep = testSteps[testStepIndex - 1];
                const previousStepSuccessful = ! previousTestStep || (previousTestStep && stepResults[previousTestStep.id]?.status === messages.TestStepResultStatus.PASSED);

                notifier.stepFinished(
                    new Step(
                        new FileSystemLocation(
                            new Path(pickle.uri),
                            gherkinStep.location.line,
                            gherkinStep.location.column,
                        ),
                        new Name(gherkinStep.keyword + gherkinStep.text)
                    ),
                    this.outcomeFrom({
                        duration: testStepFinished.testStepResult.duration.seconds,
                        exception: testStepFinished.testStepResult.exception?.message,  // todo: is type useful?
                        status: previousStepSuccessful ? status : messages.TestStepResultStatus.SKIPPED
                    })
                );
            }
        }

        onTestCaseFinished(testCaseFinished: messages.TestCaseFinished) {
            const failures: ITestCaseAttempt[] = []
            const warnings: ITestCaseAttempt[] = []
            const testCaseAttempts = this.eventDataCollector.getTestCaseAttempts()
            const testCaseAttempt = this.eventDataCollector.getTestCaseAttempt(testCaseFinished.testCaseStartedId)
            testCaseAttempts.forEach((testCaseAttempt) => {
                if (
                    isFailure(
                        testCaseAttempt.worstTestStepResult,
                        testCaseAttempt.willBeRetried
                    )
                ) {
                    failures.push(testCaseAttempt)
                } else if (
                    isWarning(
                        testCaseAttempt.worstTestStepResult,
                        testCaseAttempt.willBeRetried
                    )
                ) {
                    warnings.push(testCaseAttempt)
                }
            })
            if (this.eventDataCollector.undefinedParameterTypes.length > 0) {
                // ?
            }
            if (failures.length > 0) {
                // this.logIssues({ issues: failures, title: 'Failures' })
            }
            if (warnings.length > 0) {
                // this.logIssues({ issues: warnings, title: 'Warnings' })
            }
            // this.log(
            //     formatSummary({
            //         colorFns: this.colorFns,
            //         testCaseAttempts,
            //         testRunDuration,
            //     })
            // )

            const gherkinScenarioMap = this.formatterHelpers.GherkinDocumentParser.getGherkinScenarioMap(testCaseAttempt.gherkinDocument);
            const scenarioMap = gherkinScenarioMap[testCaseAttempt.pickle.astNodeIds[0]];
            const uri = testCaseAttempt.pickle.uri;

            // const pickleStepMap = this.formatterHelpers.PickleParser.getPickleStepMap(pickle)
            // const gherkinStepMap = this.formatterHelpers.GherkinDocumentParser.getGherkinStepMap(gherkinDocument)
            // const testStep = (testCase.testSteps || []).find(
            //     (item) => item.id === testStepStarted.testStepId
            // )

            const
                map             = cache.get(new Path(uri)),
                scenario        = map.get(Scenario).onLine(scenarioMap.location.line),
                nonHookSteps    = scenario.steps.filter(step => step instanceof Step);

            const outcome: Outcome = nonHookSteps.length > 0
                ? this.outcomeFrom(testCaseAttempt.worstTestStepResult)
                : new ImplementationPending(new ImplementationPendingError(`"${ scenario.name.value }" has no test steps`));

            notifier.scenarioFinished(scenario, map.getFirst(Feature), outcome);
        }

        outcomeFrom(result: { duration: number, exception: string | Error, status: string }): Outcome {
            const error = !! result.exception && this.errorFrom(result.exception);

            switch (result.status) {
                case messages.TestStepResultStatus.UNDEFINED:
                    return new ImplementationPending(new ImplementationPendingError('Step not implemented'));

                case messages.TestStepResultStatus.AMBIGUOUS:
                case messages.TestStepResultStatus.FAILED:
                    switch (true) {
                        case error instanceof AssertionError:       return new ExecutionFailedWithAssertionError(error as AssertionError);
                        case error instanceof TestCompromisedError: return new ExecutionCompromised(error as TestCompromisedError);
                        default:                                    return new ExecutionFailedWithError(error);
                    }

                case messages.TestStepResultStatus.PENDING:
                    return new ImplementationPending(new ImplementationPendingError('Step not implemented'));

                case messages.TestStepResultStatus.SKIPPED:
                    return new ExecutionSkipped();

                // case 'passed':
                default:
                    return new ExecutionSuccessful();
            }

        }

        errorFrom(maybeError: Error | string): Error {

            switch (true) {
                case maybeError instanceof RuntimeError:
                    return maybeError as Error;
                case maybeError instanceof Error && maybeError.name === 'AssertionError' && maybeError.message && hasOwnProperty(maybeError, 'expected') && hasOwnProperty(maybeError, 'actual'):
                    return serenity.createError(AssertionError, {
                        message: (maybeError as any).message,
                        diff: {
                            expected: (maybeError as any).expected,
                            actual: (maybeError as any).actual,
                        },
                        cause: maybeError as Error
                    });
                case typeof maybeError === 'string' && maybeError.startsWith('Multiple step definitions match'):
                    return new AmbiguousStepDefinitionError(maybeError as string);
                default:
                    return ErrorSerialiser.deserialiseFromStackTrace(maybeError as string);
            }
        }
    };
}

/**
 * @private
 */
function interleaveStepsAndHooks(steps: Step[], stepsLocations: StepLocations[]): Array<Step | Hook> {
    const
        isAHook = (stepLocations: StepLocations) =>
            stepLocations.actionLocation && ! stepLocations.sourceLocation,
        matching  = (location: StepLocations) =>
            (step: Step) =>
                step.location.path.equals(new Path(location.sourceLocation.uri)) &&
                step.location.line === location.sourceLocation.line;

    return stepsLocations.map(location =>
        isAHook(location)
            ?   new Hook(new FileSystemLocation(new Path(location.actionLocation.uri), location.actionLocation.line), new Name('Setup'))
            :   steps.find(matching(location)),
    );
}

/**
 * @private
 */
function hasOwnProperty(value: any, fieldName: string): boolean {
    return Object.prototype.hasOwnProperty.call(value, fieldName);
}
