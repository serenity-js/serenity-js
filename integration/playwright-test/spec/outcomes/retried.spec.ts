import fs from 'node:fs';
import path from 'node:path';

import { expect, ifExitCodeIsOtherThan, logOutput, PickEvent } from '@integration/testing-tools';
import { Timestamp } from '@serenity-js/core';
import {
    DomainEvent,
    RetryableSceneDetected,
    SceneFinished,
    SceneStarts,
    SceneTagged,
    TestRunFinished,
    TestRunFinishes,
    TestRunnerDetected,
    TestRunStarts
} from '@serenity-js/core/lib/events';
import {
    ArbitraryTag,
    CapabilityTag,
    CorrelationId,
    ExecutionIgnored,
    ExecutionRetriedTag,
    ExecutionSuccessful,
    FeatureTag,
    Name,
    ProblemIndication
} from '@serenity-js/core/lib/model';
import { describe, it } from 'mocha';

import { playwrightTest } from '../../src/playwright-test';

describe('Retried', () => {

    describe('Test scenario', () => {

        it('is not reported as retried when it passed the first time', async () => {
            const result = await playwrightTest(
                '--project=default',
                'outcomes/passing.spec.ts',
                '--retries=3'
            ).then(ifExitCodeIsOtherThan(0, logOutput));

            expect(result.exitCode).to.equal(0);

            PickEvent.from(result.events)
                .next(SceneStarts,         event => expect(event.details.name).to.equal(new Name('Test scenario passes')))
                .next(TestRunnerDetected,  event => expect(event.name).to.equal(new Name('Playwright')))
                .next(SceneTagged,         event => expect(event.tag).to.equal(new CapabilityTag('Outcomes')))
                .next(SceneTagged,         event => expect(event.tag).to.equal(new FeatureTag('Passing')))
                .next(SceneFinished,       event => expect(event.outcome).to.be.instanceOf(ExecutionSuccessful))

            expect(arbitraryTagsFrom(result.events)).to.deep.equal([]);
        });

        it('is not reported as retried when retries are disabled', async () => {
            const result = await playwrightTest(
                '--project=default',
                'outcomes/passing.spec.ts',
                '--retries=0'
            ).then(ifExitCodeIsOtherThan(0, logOutput));

            expect(result.exitCode).to.equal(0);

            PickEvent.from(result.events)
                .next(SceneStarts,         event => expect(event.details.name).to.equal(new Name('Test scenario passes')))
                .next(TestRunnerDetected,  event => expect(event.name).to.equal(new Name('Playwright')))
                .next(SceneTagged,         event => expect(event.tag).to.equal(new CapabilityTag('Outcomes')))
                .next(SceneTagged,         event => expect(event.tag).to.equal(new FeatureTag('Passing')))
                .next(SceneFinished,       event => expect(event.outcome).to.be.instanceOf(ExecutionSuccessful))

            expect(arbitraryTagsFrom(result.events)).to.deep.equal([]);
        });

        it('has each retry reported individually and associated with the same scene ID', async () => {
            const result = await playwrightTest(
                '--project=default',
                '--reporter=json:output/outcomes/retried.json',
                'outcomes/retried.spec.ts',
                '--retries=3'
            ).then(ifExitCodeIsOtherThan(0, logOutput));

            expect(result.exitCode).to.equal(0);

            const report = jsonFrom('output/outcomes/retried.json');
            const testId = report.suites[0].suites[0].suites[0].specs[0].id;
            const expectedSceneId = new CorrelationId(testId);

            PickEvent.from(result.events)
                .next(TestRunStarts,       event => expect(event.timestamp).to.be.instanceof(Timestamp))
                // Attempt #1
                .next(SceneStarts,         event => {
                    expect(event.sceneId).to.equal(expectedSceneId);
                    expect(event.details.name).to.equal(new Name('Test scenario passes the third time'));
                })
                .next(TestRunnerDetected,       event => expect(event.name).to.equal(new Name('Playwright')))
                .next(SceneTagged,              event => expect(event.tag).to.equal(new CapabilityTag('Outcomes')))
                .next(SceneTagged,              event => expect(event.tag).to.equal(new FeatureTag('Retried')))
                .next(RetryableSceneDetected,   event => expect(event.sceneId).to.equal(expectedSceneId))
                .next(SceneTagged,              event => expect(event.tag).to.equal(new ArbitraryTag('retried')))
                .next(SceneFinished,            event => {
                    const outcome: ProblemIndication = event.outcome as ProblemIndication;
                    expect(outcome).to.be.instanceOf(ExecutionIgnored);
                    expect(outcome.error.name).to.equal('Error');
                    expect(outcome.error.message).to.equal('Error: Trigger failure for worker 0');
                })

                // Attempt #2
                .next(SceneStarts,         event => {
                    expect(event.sceneId).to.equal(expectedSceneId);
                    expect(event.details.name).to.equal(new Name('Test scenario passes the third time'));
                })
                .next(RetryableSceneDetected,   event => expect(event.sceneId).to.equal(expectedSceneId))
                .next(SceneTagged,  event => expect(event.tag).to.equal(new ArbitraryTag('retried')))
                .next(SceneTagged,  event => expect(event.tag).to.equal(new ExecutionRetriedTag(1)))
                .next(SceneFinished,            event => {
                    const outcome: ProblemIndication = event.outcome as ProblemIndication;
                    expect(outcome).to.be.instanceOf(ExecutionIgnored);
                    expect(outcome.error.name).to.equal('Error');
                    expect(outcome.error.message).to.equal('Error: Trigger failure for worker 1');
                })

                // Attempt #3
                .next(SceneStarts,         event => {
                    expect(event.sceneId).to.equal(expectedSceneId);
                    expect(event.details.name).to.equal(new Name('Test scenario passes the third time'));
                })
                .next(RetryableSceneDetected,   event => expect(event.sceneId).to.equal(expectedSceneId))
                .next(SceneTagged,  event => expect(event.tag).to.equal(new ArbitraryTag('retried')))
                .next(SceneTagged,  event => expect(event.tag).to.equal(new ExecutionRetriedTag(2)))
                .next(SceneFinished,       event => expect(event.outcome).to.equal(new ExecutionSuccessful()))

                .next(TestRunFinishes,     event => expect(event.timestamp).to.be.instanceof(Timestamp))
                .next(TestRunFinished,     event => expect(event.timestamp).to.be.instanceof(Timestamp));
        });
    });
});

function arbitraryTagsFrom(events: DomainEvent[]): string[] {
    return events
        .filter((e: SceneTagged) =>
            e instanceof SceneTagged &&
            e.tag instanceof ArbitraryTag
        )
        .map((e: SceneTagged) => e.tag.name)
}

function jsonFrom(pathToFile: string): Record<string, any> {
    return JSON.parse(fs.readFileSync(path.join(__dirname, '../../', pathToFile), { encoding: 'utf8' }));
}
