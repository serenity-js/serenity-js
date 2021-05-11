import { messages } from '@cucumber/messages';
import { AssertionError, ImplementationPendingError, Serenity, TestCompromisedError } from '@serenity-js/core';
import {
    BusinessRuleDetected,
    DomainEvent,
    FeatureNarrativeDetected,
    RetryableSceneDetected,
    SceneDescriptionDetected,
    SceneFinished,
    SceneFinishes,
    SceneParametersDetected,
    SceneSequenceDetected,
    SceneStarts,
    SceneTagged,
    SceneTemplateDetected,
    TaskFinished,
    TaskStarts,
    TestRunnerDetected,
} from '@serenity-js/core/lib/events';
import { ErrorSerialiser, FileSystemLocation, Path } from '@serenity-js/core/lib/io';
import {
    ActivityDetails,
    ArbitraryTag,
    BusinessRule,
    CapabilityTag,
    Category,
    CorrelationId,
    Description,
    ExecutionCompromised,
    ExecutionFailedWithAssertionError,
    ExecutionFailedWithError,
    ExecutionRetriedTag,
    ExecutionSkipped,
    ExecutionSuccessful,
    FeatureTag,
    ImplementationPending,
    Name,
    Outcome,
    ScenarioDetails,
    ScenarioParameters,
    Tag,
    Tags,
    ThemeTag,
} from '@serenity-js/core/lib/model';

import { EventDataCollector, IParsedTestStep, ITestCaseAttempt } from '../types/cucumber';
import { TestStepFormatter } from './TestStepFormatter';
import { ExtractedScenario, ExtractedScenarioOutline } from './types';

/**
 * @package
 */
export class CucumberMessagesParser {
    private readonly testStepFormatter = new TestStepFormatter();

    private currentScenario: ScenarioDetails;
    private currentStepActivityId: CorrelationId;

    private readonly cwd: string;
    private readonly eventDataCollector: any;
    private readonly snippetBuilder: any;
    private readonly supportCodeLibrary: any;

    constructor(
        private readonly serenity: Serenity,
        private readonly formatterHelpers: any,     // eslint-disable-line @typescript-eslint/explicit-module-boundary-types
        formatterOptionsAndDependencies: {
            cwd: string,
            eventDataCollector: EventDataCollector,
            snippetBuilder: any,
            supportCodeLibrary: any,
        },
        private readonly shouldReportStep: (parsedTestStep: IParsedTestStep) => boolean,
    ) {
        this.cwd                = formatterOptionsAndDependencies.cwd;
        this.eventDataCollector = formatterOptionsAndDependencies.eventDataCollector;
        this.snippetBuilder     = formatterOptionsAndDependencies.snippetBuilder;
        this.supportCodeLibrary = formatterOptionsAndDependencies.supportCodeLibrary;
    }

    parseTestCaseStarted(message: messages.ITestCaseStarted): DomainEvent[] {
        const
            testCaseAttempt = this.eventDataCollector.getTestCaseAttempt(message.id),
            currentSceneId = this.serenity.assignNewSceneId();

        this.currentScenario = this.scenarioDetailsFor(
            testCaseAttempt.gherkinDocument,
            testCaseAttempt.pickle,
            this.formatterHelpers.PickleParser.getPickleLocation(testCaseAttempt),
        );

        return [
            ...this.extract(this.outlineFrom(testCaseAttempt), outline => [
                new SceneSequenceDetected(currentSceneId, outline.details, this.serenity.currentTime()),
                new SceneTemplateDetected(currentSceneId, outline.template, this.serenity.currentTime()),
                new SceneParametersDetected(
                    currentSceneId,
                    this.currentScenario,
                    outline.parameters,
                    this.serenity.currentTime(),
                ),
            ]),

            ...this.extract(this.scenarioFrom(testCaseAttempt), ({ featureDescription, rule, scenarioDescription, tags, testRunnerName }) => [
                new SceneStarts(currentSceneId, this.currentScenario, this.serenity.currentTime()),
                featureDescription && new FeatureNarrativeDetected(currentSceneId, featureDescription, this.serenity.currentTime()),
                new TestRunnerDetected(currentSceneId, testRunnerName, this.serenity.currentTime()),
                !! scenarioDescription && new SceneDescriptionDetected(currentSceneId, scenarioDescription, this.serenity.currentTime()),
                !! rule && new BusinessRuleDetected(currentSceneId, this.currentScenario, rule, this.serenity.currentTime()),
                ...tags.map(tag => new SceneTagged(currentSceneId, tag, this.serenity.currentTime())),
            ]),
        ];
    }

    parseTestStepStarted(message: messages.ITestStepStarted): DomainEvent[] {
        return this.extract(this.stepFrom(message), step => {
            this.currentStepActivityId = this.serenity.assignNewActivityId();

            if (this.shouldReportStep(step)) {
                return new TaskStarts(
                    this.serenity.currentSceneId(),
                    this.currentStepActivityId,
                    this.activityDetailsFor(step),
                    this.serenity.currentTime()
                )
            }
        });
    }

    parseTestStepFinished(message: messages.ITestStepStarted): DomainEvent[] {
        return this.extract(this.stepFrom(message), step => {
            if (this.shouldReportStep(step)) {
                return new TaskFinished(
                    this.serenity.currentSceneId(),
                    this.currentStepActivityId,
                    this.activityDetailsFor(step),
                    this.outcomeFrom(step.result, step),
                    this.serenity.currentTime()
                );
            }
        })
    }

    parseTestCaseFinishes(hookMessage: { testCaseStartedId: string, result: messages.TestStepFinished.ITestStepResult }): DomainEvent {
        return new SceneFinishes(
            this.serenity.currentSceneId(),
            this.currentScenario,
            this.outcomeFrom(hookMessage.result),
            this.serenity.currentTime()
        );
    }

    parseTestCaseFinished(message: messages.ITestCaseFinished): DomainEvent[] {
        const
            testCaseAttempt = this.eventDataCollector.getTestCaseAttempt(message.testCaseStartedId),
            currentSceneId  = this.serenity.currentSceneId();

        return this.extract(this.scenarioOutcomeFrom(testCaseAttempt), ({ outcome, willBeRetried, tags }) => [
            willBeRetried ? new RetryableSceneDetected(currentSceneId, this.serenity.currentTime()) : undefined,
            ...tags.map(tag => new SceneTagged(currentSceneId, tag, this.serenity.currentTime())),
            new SceneFinished(
                currentSceneId,
                this.currentScenario,
                outcome,
                this.serenity.currentTime()
            ),
        ]);
    }

    // ---

    private extract<T>(maybeValue: T | undefined, fn: (value: T) => DomainEvent[] | DomainEvent | void): DomainEvent[] {
        return (maybeValue !== undefined)
            ? [].concat(fn(maybeValue)).filter(item => !! item)
            : [];
    }

    private scenarioDetailsFor(gherkinDocument: messages.IGherkinDocument, pickle: messages.IPickle, location: messages.ILocation): ScenarioDetails {
        return new ScenarioDetails(
            new Name(pickle.name),
            new Category(gherkinDocument.feature.name),
            new FileSystemLocation(
                new Path(gherkinDocument.uri),
                location.line,
                location.column,
            ),
        );
    }

    private outlineFrom(testCaseAttempt: ITestCaseAttempt): ExtractedScenarioOutline {
        const
            { gherkinDocument, pickle } = testCaseAttempt,
            gherkinScenarioMap = this.formatterHelpers.GherkinDocumentParser.getGherkinScenarioMap(gherkinDocument);

        if (gherkinScenarioMap[pickle.astNodeIds[0]].examples.length === 0) {
            return; // this is not an outline, skip it
        }

        const outline   = gherkinScenarioMap[pickle.astNodeIds[0]];
        const details   = this.scenarioDetailsFor(gherkinDocument, outline, outline.location);
        const template  = new Description(outline.steps.map(step => this.testStepFormatter.format(step.keyword, step.text, step)).join('\n'));

        const examples = flatten(
            outline.examples.map(exampleSet =>
                exampleSet.tableBody.map(row => ({
                    header: exampleSet.tableHeader,
                    row,
                    name: exampleSet.name,
                    description: exampleSet.description,
                }))
            ),
        ).map((example: any) => ({
            rowId:          example.row.id,
            name:           example.name.trim(),
            description:    example.description.trim(),
            values:         example.header.cells
                .map(cell => cell.value)
                .reduce((values, header, i) => {
                    values[header] = example.row.cells[i].value;
                    return values;
                }, {}),
        }));

        const parameters = examples.find(example => example.rowId === pickle.astNodeIds[pickle.astNodeIds.length - 1]);

        return {
            details, template, parameters: new ScenarioParameters(new Name(parameters.name), new Description(parameters.description), parameters.values),
        };
    }

    private scenarioFrom({ gherkinDocument, pickle }: ITestCaseAttempt): ExtractedScenario {
        const
            gherkinScenarioMap      = this.formatterHelpers.GherkinDocumentParser.getGherkinScenarioMap(gherkinDocument),
            gherkinExampleRuleMap   = this.formatterHelpers.GherkinDocumentParser.getGherkinExampleRuleMap(gherkinDocument),
            scenarioDescription     = this.formatterHelpers.PickleParser.getScenarioDescription({ gherkinScenarioMap, pickle }),
            scenarioTags: Tag[]     = flatten<Tag>(pickle.tags.map(tag => Tags.from(tag.name))),
            rule                    = gherkinExampleRuleMap[pickle.astNodeIds[0]];

        return {
            featureDescription:     gherkinDocument.feature.description && new Description(gherkinDocument.feature.description),
            scenarioDescription:    scenarioDescription && new Description(scenarioDescription),
            rule:                   rule && new BusinessRule(new Name(rule.name), new Description(rule.description.trim())),
            testRunnerName:         new Name('Cucumber'),
            tags:                   this.scenarioHierarchyTagsFor(gherkinDocument, pickle).concat(scenarioTags),
        };
    }

    private scenarioHierarchyTagsFor(gherkinDocument: messages.IGherkinDocument, pickle: messages.IPickle): Tag[] {
        const
            directories = new Path(pickle.uri).directory().split(),
            featuresIndex = directories.indexOf('features'),
            hierarchy = [...directories.slice(featuresIndex + 1), gherkinDocument.feature.name];

        const [featureName, capabilityName, themeName]: string[] = hierarchy.reverse();

        return notEmpty([
            themeName && new ThemeTag(themeName),
            capabilityName && new CapabilityTag(capabilityName),
            new FeatureTag(featureName),
        ]);
    }

    private stepFrom(message: messages.ITestStepStarted | messages.ITestStepFinished) {
        const { testCaseStartedId, testStepId } = message;

        const testCaseAttempt = this.eventDataCollector.getTestCaseAttempt(testCaseStartedId);

        const index = testCaseAttempt.testCase.testSteps.findIndex(step => step.id === testStepId);

        return this.parseTestCaseAttempt(testCaseAttempt).testSteps[index];
    }

    private parseTestCaseAttempt(testCaseAttempt: ITestCaseAttempt) {
        // todo: workaround for https://github.com/cucumber/cucumber-js/pull/1531
        //  can be removed when the above PR is merged
        testCaseAttempt.testCase.testSteps.forEach(step => {
            if (! testCaseAttempt.stepResults[step.id]) {
                testCaseAttempt.stepResults[step.id] = { status: messages.TestStepFinished.TestStepResult.Status.UNKNOWN };
            }
        });
        // ---

        return this.formatterHelpers.parseTestCaseAttempt({
            cwd: this.cwd,
            testCaseAttempt,
            snippetBuilder: this.snippetBuilder,
            supportCodeLibrary: this.supportCodeLibrary,
        });
    }

    private activityDetailsFor(parsedTestStep: IParsedTestStep): ActivityDetails {
        return new ActivityDetails(new Name(this.testStepFormatter.format(parsedTestStep.keyword, parsedTestStep.text, parsedTestStep.argument)));
    }

    private outcomeFrom(worstResult: messages.TestStepFinished.ITestStepResult, ...steps: IParsedTestStep[]): Outcome {

        const Status = messages.TestStepFinished.TestStepResult.Status;

        switch (worstResult.status) {
            case Status.SKIPPED:
                return new ExecutionSkipped();

            case Status.UNDEFINED: {
                const snippets = steps
                    .filter(step => step.result.status === Status.UNDEFINED)
                    .map(step => step.snippet);

                const message = snippets.length > 0
                    ? ['Step implementation missing:', ...snippets].join('\n\n')
                    : 'Step implementation missing';

                return new ImplementationPending(new ImplementationPendingError(message));
            }

            case Status.PENDING:
                return new ImplementationPending(new ImplementationPendingError('Step implementation pending'));

            case Status.AMBIGUOUS:
            case Status.FAILED: {
                const error = ErrorSerialiser.deserialiseFromStackTrace(worstResult.message);
                if (error instanceof AssertionError) {
                    return new ExecutionFailedWithAssertionError(error);
                }
                if (error instanceof TestCompromisedError) {
                    return new ExecutionCompromised(error);
                }
                return new ExecutionFailedWithError(error);
            }

            case Status.UNKNOWN:
                // ignore
            case Status.PASSED: // eslint-disable-line no-fallthrough
                return new ExecutionSuccessful();
        }
    }

    private scenarioOutcomeFrom(testCaseAttempt: ITestCaseAttempt): { outcome: Outcome, willBeRetried: boolean, tags: Tag[] } {
        const parsed = this.formatterHelpers.parseTestCaseAttempt({
            cwd: this.cwd,
            snippetBuilder: this.snippetBuilder,
            supportCodeLibrary: this.supportCodeLibrary,
            testCaseAttempt
        });

        const worstStepResult   = parsed.testCase.worstTestStepResult;
        const willBeRetried     = worstStepResult.willBeRetried;
        const outcome           = this.outcomeFrom(worstStepResult, ...parsed.testSteps);

        const tags = [];

        if (testCaseAttempt.attempt > 0 || willBeRetried) {
            tags.push(new ArbitraryTag('retried'));
        }

        if (testCaseAttempt.attempt > 0) {
            tags.push(new ExecutionRetriedTag(testCaseAttempt.attempt));
        }

        return { outcome, willBeRetried, tags };
    }
}

function flatten<T>(listOfLists: T[][]): T[] {
    return listOfLists.reduce((acc, current) => acc.concat(current), []);
}

function notEmpty<T>(list: T[]) {
    return list.filter(item => !!item);
}
