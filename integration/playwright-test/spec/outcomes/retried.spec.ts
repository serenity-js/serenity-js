import fs from 'node:fs';
import path from 'node:path';

import { expect, ifExitCodeIsOtherThan, logOutput, PickEvent } from '@integration/testing-tools';
import { Timestamp } from '@serenity-js/core';
import {
    DomainEvent,
    RetryableSceneDetected,
    SceneFinished,
    SceneParametersDetected,
    SceneSequenceDetected,
    SceneStarts,
    SceneTagged,
    SceneTemplateDetected,
    TestRunFinished,
    TestRunFinishes,
    TestRunnerDetected,
    TestRunStarts
} from '@serenity-js/core/lib/events';
import {
    ArbitraryTag,
    CapabilityTag,
    Category,
    Description,
    ExecutionIgnored,
    ExecutionSuccessful,
    FeatureTag,
    Name,
    ProblemIndication,
    ProjectTag
} from '@serenity-js/core/lib/model';
import { PlaywrightSceneId } from '@serenity-js/playwright-test/lib/events';
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
                .next(SceneTagged,         event => expect(event.tag).to.equal(new ProjectTag('default')))
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
                .next(SceneTagged,         event => expect(event.tag).to.equal(new ProjectTag('default')))
                .next(SceneFinished,       event => expect(event.outcome).to.be.instanceOf(ExecutionSuccessful))

            expect(arbitraryTagsFrom(result.events)).to.deep.equal([ ]);
        });

        it('has each retry reported individually, associated with the same scene ID, but aggregated per project', async () => {
            const result = await playwrightTest(
                '--project=default',
                '--reporter=json:output/outcomes/retried.json',
                'outcomes/retried.spec.ts',
                '--retries=3'
            ).then(ifExitCodeIsOtherThan(0, logOutput));

            expect(result.exitCode).to.equal(0);

            const report = jsonFrom('output/outcomes/retried.json');
            const testId = report.suites[0].suites[0].suites[0].specs[0].id;
            const expectedSceneIdAttempt1 = PlaywrightSceneId.from('default', { id: testId, repeatEachIndex: 0 }, { retry: 0 });
            const expectedSceneIdAttempt2 = PlaywrightSceneId.from('default', { id: testId, repeatEachIndex: 0 }, { retry: 1 });
            const expectedSceneIdAttempt3 = PlaywrightSceneId.from('default', { id: testId, repeatEachIndex: 0 }, { retry: 2 });

            const expectedScenarioName = new Name('Test scenario passes the third time');
            const expectedSequenceName = new Name('Test scenario passes the third time (default)');
            const expectedScenarioDescription = new Description('');
            const expectedCategoryName = new Category('Retried');
            const expectedParametersName = new Name('');
            const expectedParametersDescription = new Description('Max retries: 3');

            PickEvent.from(result.events)
                .next(TestRunStarts,       event => expect(event.timestamp).to.be.instanceof(Timestamp))
                // Attempt #1
                .next(SceneSequenceDetected, event => {
                    expect(event.sceneId).to.equal(expectedSceneIdAttempt1);
                    expect(event.details.name).to.equal(expectedSequenceName);
                    expect(event.details.category).to.equal(expectedCategoryName);
                    // expect(event.details.location.line).to.equal(outlineLine);
                })
                .next(SceneTemplateDetected, event => {
                    expect(event.sceneId).to.equal(expectedSceneIdAttempt1);
                    expect(event.template).to.equal(expectedScenarioDescription);
                })
                .next(SceneParametersDetected, event => {
                    expect(event.sceneId).to.equal(expectedSceneIdAttempt1);
                    expect(event.details.name).to.equal(expectedSequenceName);
                    expect(event.details.category).to.equal(expectedCategoryName);
                    expect(event.parameters.name).to.equal(expectedParametersName);
                    expect(event.parameters.description).to.equal(expectedParametersDescription);
                    expect(event.parameters.values).to.deep.equal({ Retries: 'Attempt #1' });
                })
                .next(SceneStarts,         event => {
                    expect(event.sceneId).to.equal(expectedSceneIdAttempt1);
                    expect(event.details.name).to.equal(expectedScenarioName);
                })
                .next(TestRunnerDetected,       event => expect(event.name).to.equal(new Name('Playwright')))
                .next(SceneTagged,              event => expect(event.tag).to.equal(new CapabilityTag('Outcomes')))
                .next(SceneTagged,              event => expect(event.tag).to.equal(new FeatureTag('Retried')))
                .next(RetryableSceneDetected,   event => expect(event.sceneId).to.equal(expectedSceneIdAttempt1))
                .next(SceneTagged,              event => expect(event.tag).to.equal(new ArbitraryTag('retried')))
                .next(SceneFinished,            event => {
                    const outcome: ProblemIndication = event.outcome as ProblemIndication;
                    expect(outcome).to.be.instanceOf(ExecutionIgnored);
                    expect(outcome.error.name).to.equal('Error');
                    expect(outcome.error.message).to.equal('Error: Trigger failure for worker 0');
                })

                // Attempt #2
                .next(SceneSequenceDetected, event => {
                    expect(event.sceneId).to.equal(expectedSceneIdAttempt2);
                    expect(event.details.name).to.equal(expectedSequenceName);
                    expect(event.details.category).to.equal(expectedCategoryName);
                    // expect(event.details.location.line).to.equal(outlineLine);
                })
                .next(SceneTemplateDetected, event => {
                    expect(event.sceneId).to.equal(expectedSceneIdAttempt2);
                    expect(event.template).to.equal(expectedScenarioDescription);
                })
                .next(SceneParametersDetected, event => {
                    expect(event.sceneId).to.equal(expectedSceneIdAttempt2);
                    expect(event.details.name).to.equal(expectedSequenceName);
                    expect(event.details.category).to.equal(expectedCategoryName);
                    expect(event.parameters.name).to.equal(expectedParametersName);
                    expect(event.parameters.description).to.equal(expectedParametersDescription);
                    expect(event.parameters.values).to.deep.equal({ Retries: 'Attempt #2' });
                })
                .next(SceneStarts,         event => {
                    expect(event.sceneId).to.equal(expectedSceneIdAttempt2);
                    expect(event.details.name).to.equal(expectedScenarioName);
                })
                .next(RetryableSceneDetected,   event => expect(event.sceneId).to.equal(expectedSceneIdAttempt2))
                .next(SceneTagged,  event => expect(event.tag).to.equal(new ArbitraryTag('retried')))
                .next(SceneFinished,            event => {
                    const outcome: ProblemIndication = event.outcome as ProblemIndication;
                    expect(outcome).to.be.instanceOf(ExecutionIgnored);
                    expect(outcome.error.name).to.equal('Error');
                    expect(outcome.error.message).to.equal('Error: Trigger failure for worker 1');
                })

                // Attempt #3
                .next(SceneSequenceDetected, event => {
                    expect(event.sceneId).to.equal(expectedSceneIdAttempt3);
                    expect(event.details.name).to.equal(expectedSequenceName);
                    expect(event.details.category).to.equal(expectedCategoryName);
                    // expect(event.details.location.line).to.equal(outlineLine);
                })
                .next(SceneTemplateDetected, event => {
                    expect(event.sceneId).to.equal(expectedSceneIdAttempt3);
                    expect(event.template).to.equal(expectedScenarioDescription);
                })
                .next(SceneParametersDetected, event => {
                    expect(event.sceneId).to.equal(expectedSceneIdAttempt3);
                    expect(event.details.name).to.equal(expectedSequenceName);
                    expect(event.details.category).to.equal(expectedCategoryName);
                    expect(event.parameters.name).to.equal(expectedParametersName);
                    expect(event.parameters.description).to.equal(expectedParametersDescription);
                    expect(event.parameters.values).to.deep.equal({ Retries: 'Attempt #3' });
                })
                .next(SceneStarts, event => {
                    expect(event.sceneId).to.equal(expectedSceneIdAttempt3);
                    expect(event.details.name).to.equal(expectedScenarioName);
                })
                // todo: maybe remove the RetryableSceneDetected altogether?
                .next(RetryableSceneDetected, event => expect(event.sceneId).to.equal(expectedSceneIdAttempt3))
                .next(SceneTagged,      event => expect(event.tag).to.equal(new ArbitraryTag('retried')))
                .next(SceneFinished,    event => expect(event.outcome).to.equal(new ExecutionSuccessful()))

                .next(TestRunFinishes,  event => expect(event.timestamp).to.be.instanceof(Timestamp))
                .next(TestRunFinished,  event => expect(event.timestamp).to.be.instanceof(Timestamp));
        });

        // todo: add a test for repeated tests and repeated tests with retries(?)
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
