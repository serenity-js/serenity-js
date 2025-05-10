import { type FullConfig } from '@playwright/test';
import { type TestCase, type TestResult } from '@playwright/test/reporter';
import { Duration, LogicError, Timestamp } from '@serenity-js/core';
import type { DomainEvent } from '@serenity-js/core/lib/events';
import {
    RetryableSceneDetected,
    SceneFinished,
    SceneStarts,
    SceneTagged,
    TestRunnerDetected
} from '@serenity-js/core/lib/events';
import { FileSystem, FileSystemLocation, Path, RequirementsHierarchy } from '@serenity-js/core/lib/io';
import type { Outcome, Tag } from '@serenity-js/core/lib/model';
import {
    ArbitraryTag,
    Category,
    CorrelationId,
    ExecutionFailedWithAssertionError,
    ExecutionFailedWithError,
    ExecutionIgnored,
    ExecutionRetriedTag,
    ExecutionSkipped,
    ExecutionSuccessful,
    Name,
    ScenarioDetails,
    Tags
} from '@serenity-js/core/lib/model';

import { PlaywrightErrorParser } from './PlaywrightErrorParser';

export class PlaywrightEventBuffer {
    private readonly errorParser = new PlaywrightErrorParser();
    private requirementsHierarchy: RequirementsHierarchy;

    private readonly events = new Map<string, DomainEvent[]>();

    constructor() {
    }

    configure(config: Pick<FullConfig, 'rootDir'>): void {
        this.requirementsHierarchy = new RequirementsHierarchy(
            new FileSystem(Path.from(config.rootDir)),
        );
    }

    recordTestStart(test: TestCase, result: TestResult): void {
        const sceneId = new CorrelationId(test.id);
        const sceneStartTime = new Timestamp(result.startTime);

        const { scenarioDetails, scenarioTags } = this.scenarioDetailsFrom(test);

        const tags: Tag[] = [
            ... scenarioTags,
            ... test.tags.flatMap(tag => Tags.from(tag)),
        ];

        this.events.set(sceneId.value, [
            new SceneStarts(sceneId, scenarioDetails, sceneStartTime),
            ...this.requirementsHierarchy
                .requirementTagsFor(scenarioDetails.location.path, scenarioDetails.category.value)
                .map(tag => new SceneTagged(sceneId, tag, sceneStartTime)),

            new TestRunnerDetected(
                sceneId,
                new Name('Playwright'),
                sceneStartTime,
            ),

            ...tags.map(tag => new SceneTagged(sceneId, tag, sceneStartTime)),
        ]);
    }

    // todo: remove worstInteractionOutcome when screenplay and non-screenplay reporting is separated
    recordTestEnd(test: TestCase, result: TestResult, worstInteractionOutcome: Outcome): void {
        const sceneId = new CorrelationId(test.id);
        const sceneEndTime = new Timestamp(result.startTime).plus(Duration.ofMilliseconds(result.duration));
        const scenarioOutcome = this.outcomeFrom(test, result);

        if (test.retries > 0) {

            this.events.get(sceneId.value).push(
                new RetryableSceneDetected(sceneId, sceneEndTime),
            );

            if (result.retry > 0 || result.status !== 'passed') {
                this.events.get(sceneId.value).push(
                    new SceneTagged(
                        sceneId,
                        new ArbitraryTag('retried'), // todo: replace with a dedicated tag
                        sceneEndTime,
                    ),
                    new SceneTagged(
                        sceneId,
                        new ExecutionRetriedTag(result.retry),
                        sceneEndTime,
                    ),
                );
            }
        }

        // Emit SceneFinished event with the sceneId, outcome, and sceneEndTime
        this.events.get(sceneId.value).push(
            new SceneFinished(
                sceneId,
                this.scenarioDetailsFrom(test).scenarioDetails,
                this.determineScenarioOutcome(worstInteractionOutcome, scenarioOutcome),
                sceneEndTime,
            ),
        );
    }

    // todo: remove when Test API exports events to the file system
    private determineScenarioOutcome(
        worstInteractionOutcome: Outcome,
        scenarioOutcome: Outcome,
    ): Outcome {
        if (worstInteractionOutcome instanceof ExecutionFailedWithAssertionError) {
            return worstInteractionOutcome;
        }

        return worstInteractionOutcome.isWorseThan(scenarioOutcome)
            ? worstInteractionOutcome
            : scenarioOutcome;
    }

    // todo: remove when Test API exports events to the file system
    push(sceneId: CorrelationId, event: DomainEvent): void {

        const testId = sceneId.value;

        if (! this.events.has(testId)) {
            throw new LogicError(`No event buffer found for test ID: ${ testId }`);
        }

        this.events.get(testId).push(event);
    }

    flush(testId: TestCase['id']): DomainEvent[] {
        const events = this.events.get(testId);

        if (! events) {
            throw new LogicError(`No events found for test ID: ${ testId }`);
        }

        this.events.delete(testId);

        return events;
    }

    private scenarioDetailsFrom(test: TestCase): { scenarioDetails: ScenarioDetails, scenarioTags: Tag[] } {
        const [
            root_,
            browserName_,
            fileName,
            describeOrItBlockTitle,
            ...nestedTitles
        ] = test.titlePath();

        const path = new Path(test.location.file);
        const scenarioName = nestedTitles.join(' ').trim();

        const name = scenarioName || describeOrItBlockTitle;
        const featureName = scenarioName ? describeOrItBlockTitle : fileName;

        return {
            scenarioDetails: new ScenarioDetails(
                new Name(Tags.stripFrom(name)),
                new Category(Tags.stripFrom(featureName)),
                new FileSystemLocation(path, test.location.line, test.location.column),
            ),
            scenarioTags: Tags.from(`${ featureName } ${ name }`),
        };
    }

    private outcomeFrom(test: TestCase, result: TestResult): Outcome {
        const outcome = test.outcome();

        if (outcome === 'skipped') {
            return new ExecutionSkipped();
        }

        if (outcome === 'unexpected' && result.status === 'passed') {
            return new ExecutionFailedWithError(
                new LogicError(`Scenario expected to fail, but ${ result.status }`),
            );
        }

        if ([ 'failed', 'interrupted', 'timedOut' ].includes(result.status)) {
            if (test.retries > result.retry) {
                return new ExecutionIgnored(this.errorParser.errorFrom(result.error));
            }

            return new ExecutionFailedWithError(
                this.errorParser.errorFrom(result.error),
            );
        }

        return new ExecutionSuccessful();
    }
}
