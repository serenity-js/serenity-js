import { expect, ifExitCodeIsOtherThan, logOutput, PickEvent } from '@integration/testing-tools';
import { SceneFinished, SceneStarts, SceneTagged, TestRunnerDetected } from '@serenity-js/core/lib/events';
import { CapabilityTag, ExecutionSkipped, FeatureTag, Name, ThemeTag } from '@serenity-js/core/lib/model';
import { describe, it } from 'mocha';

import { playwrightTest } from '../../src/playwright-test';

describe('Skipped', () => {

    describe('Test scenario is reported as skipped when', () => {

        it('is explicitly marked as skipped', async () => {
            const result = await playwrightTest(
                '--project=default',
                'outcomes/skipped/skip.spec.ts',
            ).then(ifExitCodeIsOtherThan(0, logOutput));

            expect(result.exitCode).to.equal(0);

            PickEvent.from(result.events)
                .next(SceneStarts,         event => expect(event.details.name).to.equal(new Name('Test scenario is marked as skipped')))
                .next(SceneTagged,         event => expect(event.tag).to.equal(new ThemeTag('Outcomes')))
                .next(SceneTagged,         event => expect(event.tag).to.equal(new CapabilityTag('Skipped')))
                .next(SceneTagged,         event => expect(event.tag).to.equal(new FeatureTag('Skip')))
                .next(TestRunnerDetected,  event => expect(event.name).to.equal(new Name('Playwright')))
                .next(SceneFinished,       event => expect(event.outcome).to.be.instanceOf(ExecutionSkipped))
            ;
        });

        it('is marked as fixme', async () => {
            const result = await playwrightTest(
                '--project=default',
                'skipped/fixme.spec.ts'
            ).then(ifExitCodeIsOtherThan(0, logOutput));

            expect(result.exitCode).to.equal(0);

            PickEvent.from(result.events)
                .next(SceneStarts,         event => expect(event.details.name).to.equal(new Name('Test scenario is marked as fixme')))
                .next(SceneTagged,         event => expect(event.tag).to.equal(new ThemeTag('Outcomes')))
                .next(SceneTagged,         event => expect(event.tag).to.equal(new CapabilityTag('Skipped')))
                .next(SceneTagged,         event => expect(event.tag).to.equal(new FeatureTag('Fixme')))
                .next(TestRunnerDetected,  event => expect(event.name).to.equal(new Name('Playwright')))
                .next(SceneFinished,       event => expect(event.outcome).to.be.instanceOf(ExecutionSkipped))
            ;
        });

        it('is skipped conditionally', async () => {
            const result = await playwrightTest(
                '--project=default',
                'outcomes/skipped/skip_conditional.spec.ts',
            ).then(ifExitCodeIsOtherThan(0, logOutput));

            expect(result.exitCode).to.equal(0);

            PickEvent.from(result.events)
                .next(SceneStarts,         event => expect(event.details.name).to.equal(new Name('Test scenario is marked as skipped conditionally')))
                .next(SceneTagged,         event => expect(event.tag).to.equal(new ThemeTag('Outcomes')))
                .next(SceneTagged,         event => expect(event.tag).to.equal(new CapabilityTag('Skipped')))
                .next(SceneTagged,         event => expect(event.tag).to.equal(new FeatureTag('Skip conditional')))
                .next(TestRunnerDetected,  event => expect(event.name).to.equal(new Name('Playwright')))
                .next(SceneFinished,       event => expect(event.outcome).to.be.instanceOf(ExecutionSkipped))
            ;
        });

        it('is skipped at the describe level', async () => {
            const result = await playwrightTest(
                '--project=default',
                'outcomes/skipped/skip_describe.spec.ts',
            ).then(ifExitCodeIsOtherThan(0, logOutput));

            expect(result.exitCode).to.equal(0);

            PickEvent.from(result.events)
                .next(SceneStarts,         event => expect(event.details.name).to.equal(new Name('Test scenario is marked as skipped at the describe level')))
                .next(SceneTagged,         event => expect(event.tag).to.equal(new ThemeTag('Outcomes')))
                .next(SceneTagged,         event => expect(event.tag).to.equal(new CapabilityTag('Skipped')))
                .next(SceneTagged,         event => expect(event.tag).to.equal(new FeatureTag('Skip describe')))
                .next(TestRunnerDetected,  event => expect(event.name).to.equal(new Name('Playwright')))
                .next(SceneFinished,       event => expect(event.outcome).to.be.instanceOf(ExecutionSkipped))
            ;
        });

        it('is skipped conditionally at the describe level', async () => {
            const result = await playwrightTest(
                '--project=default',
                'outcomes/skipped/skip_describe_conditional.spec.ts',
            ).then(ifExitCodeIsOtherThan(0, logOutput));

            expect(result.exitCode).to.equal(0);

            PickEvent.from(result.events)
                .next(SceneStarts,         event => expect(event.details.name).to.equal(new Name('Test scenario is marked as skipped conditionally at the describe level')))
                .next(SceneTagged,         event => expect(event.tag).to.equal(new ThemeTag('Outcomes')))
                .next(SceneTagged,         event => expect(event.tag).to.equal(new CapabilityTag('Skipped')))
                .next(SceneTagged,         event => expect(event.tag).to.equal(new FeatureTag('Skip describe conditional')))
                .next(TestRunnerDetected,  event => expect(event.name).to.equal(new Name('Playwright')))
                .next(SceneFinished,       event => expect(event.outcome).to.be.instanceOf(ExecutionSkipped))
            ;
        });
    });
});
