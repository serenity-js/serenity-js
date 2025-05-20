import { expect, ifExitCodeIsOtherThan, logOutput, PickEvent } from '@integration/testing-tools';
import { Timestamp } from '@serenity-js/core';
import {
    InteractionStarts,
    SceneFinished,
    SceneFinishes,
    SceneStarts,
    SceneTagged
} from '@serenity-js/core/lib/events';
import { CapabilityTag, ExecutionSuccessful, FeatureTag, Name, ThemeTag } from '@serenity-js/core/lib/model';
import { describe, it } from 'mocha';

import { playwrightTest } from '../src/playwright-test';

describe('Hooks', function () {

    describe('Events log for a test scenario', () => {

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
    });
});
