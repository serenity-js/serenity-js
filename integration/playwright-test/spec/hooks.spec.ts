import fs from 'node:fs';
import path from 'node:path';

import { expect, ifExitCodeIsOtherThan, logOutput, PickEvent } from '@integration/testing-tools';
import { Timestamp } from '@serenity-js/core';
import {
    InteractionFinished,
    InteractionStarts,
    SceneFinished,
    SceneFinishes,
    SceneStarts,
    SceneTagged
} from '@serenity-js/core/lib/events';
import {
    CapabilityTag,
    CorrelationId,
    ExecutionFailedWithAssertionError,
    ExecutionSkipped,
    ExecutionSuccessful,
    FeatureTag,
    Name,
    ProblemIndication,
    ThemeTag
} from '@serenity-js/core/lib/model';
import { describe, it } from 'mocha';

import { playwrightTest } from '../src/playwright-test';

describe('Hooks', function () {

    describe('Event log for a test scenario', () => {

        it('includes events that occurred in beforeEach and afterEach hooks', async () => {
            const result = await playwrightTest(
                `--project=default`,
                'screenplay/hooks/beforeEach_and_afterEach_hooks.spec.ts'
            ).then(ifExitCodeIsOtherThan(0, logOutput));

            expect(result.exitCode).to.equal(0);

            PickEvent.from(result.events)

                .next(SceneStarts,         event => expect(event.details.name).to.equal(new Name('Test scenario includes events that occurred in beforeEach and afterEach hooks #1')))
                .next(SceneTagged,         event => expect(event.tag).to.equal(new ThemeTag('Screenplay')))
                .next(SceneTagged,         event => expect(event.tag).to.equal(new CapabilityTag('Hooks')))
                .next(SceneTagged,         event => expect(event.tag).to.equal(new FeatureTag('BeforeEach and afterEach hooks')))
                .next(InteractionStarts,   event => expect(event.details.name).to.equal(new Name(`Alice logs: 'BrowseTheWebWithPlaywright'`)))
                .next(InteractionStarts,   event => expect(event.details.name).to.equal(new Name(`Betty logs: 'BrowseTheWebWithPlaywright'`)))
                .next(InteractionStarts,   event => expect(event.details.name).to.equal(new Name(`Charlie logs: 'BrowseTheWebWithPlaywright'`)))
                .next(SceneFinished,       event => expect(event.outcome).to.be.instanceOf(ExecutionSuccessful))

                .next(SceneStarts,         event => expect(event.details.name).to.equal(new Name('Test scenario includes events that occurred in beforeEach and afterEach hooks #2')))
                .next(SceneTagged,         event => expect(event.tag).to.equal(new ThemeTag('Screenplay')))
                .next(SceneTagged,         event => expect(event.tag).to.equal(new CapabilityTag('Hooks')))
                .next(SceneTagged,         event => expect(event.tag).to.equal(new FeatureTag('BeforeEach and afterEach hooks')))
                .next(InteractionStarts,   event => expect(event.details.name).to.equal(new Name(`Alice logs: 'BrowseTheWebWithPlaywright'`)))
                .next(InteractionStarts,   event => expect(event.details.name).to.equal(new Name(`Barry logs: 'BrowseTheWebWithPlaywright'`)))
                .next(InteractionStarts,   event => expect(event.details.name).to.equal(new Name(`Charlie logs: 'BrowseTheWebWithPlaywright'`)))
                .next(SceneFinished,       event => expect(event.outcome).to.be.instanceOf(ExecutionSuccessful))
            ;
        });

        it('includes events that occurred in beforeAll and afterAll hooks', async () => {
            const result = await playwrightTest(
                `--project=default`,
                'screenplay/hooks/beforeAll_and_afterAll_hooks.spec.ts'
            ).then(ifExitCodeIsOtherThan(0, logOutput));

            expect(result.exitCode).to.equal(0);

            PickEvent.from(result.events)

                .next(SceneStarts,         event => expect(event.details.name).to.equal(new Name('First test scenario includes events that occurred in beforeAll hooks')))
                .next(SceneTagged,         event => expect(event.tag).to.equal(new ThemeTag('Screenplay')))
                .next(SceneTagged,         event => expect(event.tag).to.equal(new CapabilityTag('Hooks')))
                .next(SceneTagged,         event => expect(event.tag).to.equal(new FeatureTag('BeforeAll and afterAll hooks')))
                .next(InteractionStarts,   event => expect(event.details.name).to.equal(new Name(`Alice logs: 'BrowseTheWebWithPlaywright'`)))
                .next(InteractionStarts,   event => expect(event.details.name).to.equal(new Name(`Alex logs: 'BrowseTheWebWithPlaywright'`)))
                .next(InteractionStarts,   event => expect(event.details.name).to.equal(new Name(`Betty logs: 'BrowseTheWebWithPlaywright'`)))
                .next(SceneFinishes,       event => expect(event.timestamp).to.be.instanceOf(Timestamp))
                .next(SceneFinished,       event => expect(event.outcome).to.be.instanceOf(ExecutionSuccessful))

                .next(SceneStarts,         event => expect(event.details.name).to.equal(new Name('Middle test scenario does not include events from beforeAll and afterAll hooks')))
                .next(SceneTagged,         event => expect(event.tag).to.equal(new ThemeTag('Screenplay')))
                .next(SceneTagged,         event => expect(event.tag).to.equal(new CapabilityTag('Hooks')))
                .next(SceneTagged,         event => expect(event.tag).to.equal(new FeatureTag('BeforeAll and afterAll hooks')))
                .next(InteractionStarts,   event => expect(event.details.name).to.equal(new Name(`Bobby logs: 'BrowseTheWebWithPlaywright'`)))
                .next(SceneFinishes,       event => expect(event.timestamp).to.be.instanceOf(Timestamp))
                .next(SceneFinished,       event => expect(event.outcome).to.be.instanceOf(ExecutionSuccessful))

                .next(SceneStarts,         event => expect(event.details.name).to.equal(new Name('Last test scenario includes events that occurred in afterAll hooks')))
                .next(SceneTagged,         event => expect(event.tag).to.equal(new ThemeTag('Screenplay')))
                .next(SceneTagged,         event => expect(event.tag).to.equal(new CapabilityTag('Hooks')))
                .next(SceneTagged,         event => expect(event.tag).to.equal(new FeatureTag('BeforeAll and afterAll hooks')))
                .next(InteractionStarts,   event => expect(event.details.name).to.equal(new Name(`Barry logs: 'BrowseTheWebWithPlaywright'`)))
                .next(SceneFinishes,       event => expect(event.timestamp).to.be.instanceOf(Timestamp))
                .next(InteractionStarts,   event => expect(event.details.name).to.equal(new Name(`Charlie logs: 'BrowseTheWebWithPlaywright'`)))
                .next(InteractionStarts,   event => expect(event.details.name).to.equal(new Name(`Chloe logs: 'BrowseTheWebWithPlaywright'`)))
                .next(SceneFinished,       event => expect(event.outcome).to.be.instanceOf(ExecutionSuccessful))
            ;
        });

        /**
         * Errors thrown in a beforeAll hook prevent the test scenario from executing.
         */
        it('includes errors thrown in a beforeAll hook', async () => {
            const result = await playwrightTest(
                `--project=default`,
                '--reporter=json:output/screenplay/hooks/beforeAll_failure.json',
                'screenplay/hooks/beforeAll_failure.spec.ts'
            ).then(ifExitCodeIsOtherThan(1, logOutput));

            expect(result.exitCode).to.equal(1);

            const report = jsonFrom('output/screenplay/hooks/beforeAll_failure.json');

            const testId1 = report.suites[0].suites[0].suites[0].specs[0].id;
            const expectedSceneId1 = new CorrelationId(testId1);

            const testId2 = report.suites[0].suites[0].suites[0].specs[1].id;
            const expectedSceneId2 = new CorrelationId(testId2);

            PickEvent.from(result.events)

                .next(SceneStarts,         event => {
                    expect(event.details.name).to.equal(new Name('Test scenario is never executed #1'));
                    expect(event.sceneId).to.equal(expectedSceneId1);
                })
                .next(SceneTagged,         event => expect(event.tag).to.equal(new ThemeTag('Screenplay')))
                .next(SceneTagged,         event => expect(event.tag).to.equal(new CapabilityTag('Hooks')))
                .next(SceneTagged,         event => expect(event.tag).to.equal(new FeatureTag('BeforeAll failure')))
                .next(InteractionStarts,   event => {
                    expect(event.details.name).to.equal(new Name(`Alice ensures that true does equal false`))
                    expect(event.sceneId).to.equal(expectedSceneId1);
                })
                .next(InteractionFinished, event => {
                    expect(event.details.name).to.equal(new Name(`Alice ensures that true does equal false`));
                    expect(event.sceneId).to.equal(expectedSceneId1);

                    const outcome: ProblemIndication = event.outcome as ProblemIndication;
                    expect(outcome).to.be.instanceOf(ExecutionFailedWithAssertionError);
                    expect(outcome.error.name).to.equal('AssertionError');
                    expect(outcome.error.message).to.match(/Expected true to equal false/);
                })
                .next(SceneFinished, event => {
                    const outcome: ProblemIndication = event.outcome as ProblemIndication;
                    expect(outcome).to.be.instanceOf(ExecutionFailedWithAssertionError);
                    expect(outcome.error.name).to.equal('AssertionError');
                    expect(outcome.error.message).to.match(/Expected true to equal false/);
                })

                .next(SceneStarts,         event => {
                    expect(event.details.name).to.equal(new Name('Test scenario is never executed #2'));
                    expect(event.sceneId).to.equal(expectedSceneId2);
                })
                .next(SceneTagged,         event => expect(event.tag).to.equal(new ThemeTag('Screenplay')))
                .next(SceneTagged,         event => expect(event.tag).to.equal(new CapabilityTag('Hooks')))
                .next(SceneTagged,         event => expect(event.tag).to.equal(new FeatureTag('BeforeAll failure')))
                .next(SceneFinished, event => {
                    const outcome: ProblemIndication = event.outcome as ProblemIndication;
                    expect(outcome).to.be.instanceOf(ExecutionSkipped);
                })
            ;
        });

        it('includes errors thrown in an afterAll hook', async () => {
            const result = await playwrightTest(
                `--project=default`,
                '--reporter=json:output/screenplay/hooks/afterAll_failure.json',
                'screenplay/hooks/afterAll_failure.spec.ts'
            ).then(ifExitCodeIsOtherThan(1, logOutput));

            expect(result.exitCode).to.equal(1);

            const report = jsonFrom('output/screenplay/hooks/afterAll_failure.json');

            const testId = report.suites[0].suites[0].suites[0].specs[0].id;
            const expectedSceneId = new CorrelationId(testId);

            PickEvent.from(result.events)

                .next(SceneStarts,         event => {
                    expect(event.details.name).to.equal(new Name('Test scenario is executed'));
                    expect(event.sceneId).to.equal(expectedSceneId);
                })
                .next(SceneTagged,         event => expect(event.tag).to.equal(new ThemeTag('Screenplay')))
                .next(SceneTagged,         event => expect(event.tag).to.equal(new CapabilityTag('Hooks')))
                .next(SceneTagged,         event => expect(event.tag).to.equal(new FeatureTag('BeforeAll failure')))
                .next(InteractionFinished, event => {
                    expect(event.details.name).to.equal(new Name(`Betty logs: 'BrowseTheWebWithPlaywright'`))
                    expect(event.sceneId).to.equal(expectedSceneId);
                })
                .next(InteractionFinished, event => {
                    expect(event.details.name).to.equal(new Name(`Chloe ensures that true does equal false`));
                    expect(event.sceneId).to.equal(expectedSceneId);

                    const outcome: ProblemIndication = event.outcome as ProblemIndication;
                    expect(outcome).to.be.instanceOf(ExecutionFailedWithAssertionError);
                    expect(outcome.error.name).to.equal('AssertionError');
                    expect(outcome.error.message).to.match(/Expected true to equal false/);
                })
                .next(InteractionFinished, event => {
                    expect(event.details.name).to.equal(new Name(`Cindy logs: 'BrowseTheWebWithPlaywright'`));
                    expect(event.sceneId).to.equal(expectedSceneId);
                    expect(event.outcome).to.be.instanceOf(ExecutionSuccessful)
                })
                .next(SceneFinished, event => {
                    const outcome: ProblemIndication = event.outcome as ProblemIndication;
                    expect(outcome).to.be.instanceOf(ExecutionFailedWithAssertionError);
                    expect(outcome.error.name).to.equal('AssertionError');
                    expect(outcome.error.message).to.match(/Expected true to equal false/);
                })
            ;
        }).timeout(60_000);
    });
});

function jsonFrom(pathToFile: string): Record<string, any> {
    return JSON.parse(fs.readFileSync(path.join(__dirname, '../', pathToFile), { encoding: 'utf8' }));
}
