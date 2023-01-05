import { expect, ifExitCodeIsOtherThan, logOutput, PickEvent } from '@integration/testing-tools';
import { SceneFinished, SceneStarts, SceneTagged, TestRunnerDetected } from '@serenity-js/core/lib/events';
import { ExecutionSkipped, FeatureTag, Name } from '@serenity-js/core/lib/model';
import { describe, it } from 'mocha';

import { playwrightTest } from '../src/playwright-test';

describe('@serenity-js/playwright-test', function () {

    describe('recognises a skipped scenario that', () => {

        it('is marked as skipped', () => playwrightTest('--project=default', 'skipped/marked-as-skipped.spec.ts')
            .then(ifExitCodeIsOtherThan(0, logOutput))
            .then(result => {

                expect(result.exitCode).to.equal(0);

                PickEvent.from(result.events)
                    .next(SceneStarts,         event => expect(event.details.name).to.equal(new Name('A scenario is marked as skipped')))
                    .next(SceneTagged,         event => expect(event.tag).to.equal(new FeatureTag('Playwright Test reporting')))
                    .next(TestRunnerDetected,  event => expect(event.name).to.equal(new Name('Playwright')))
                    .next(SceneFinished,       event => expect(event.outcome).to.be.instanceOf(ExecutionSkipped))
                ;
            }));

        it('is marked as skipped conditionally', () => playwrightTest('--project=default', 'skipped/marked-as-skipped-conditionally.spec.ts')
            .then(ifExitCodeIsOtherThan(0, logOutput))
            .then(result => {

                expect(result.exitCode).to.equal(0);

                PickEvent.from(result.events)
                    .next(SceneStarts,         event => expect(event.details.name).to.equal(new Name('A scenario is marked as skipped conditionally')))
                    .next(SceneTagged,         event => expect(event.tag).to.equal(new FeatureTag('Playwright Test reporting')))
                    .next(TestRunnerDetected,  event => expect(event.name).to.equal(new Name('Playwright')))
                    .next(SceneFinished,       event => expect(event.outcome).to.be.instanceOf(ExecutionSkipped))
                ;
            }));

        it('is marked as skipped at the group level', () => playwrightTest('--project=default', 'skipped/marked-as-skipped-at-group-level.spec.ts')
            .then(ifExitCodeIsOtherThan(0, logOutput))
            .then(result => {

                expect(result.exitCode).to.equal(0);

                PickEvent.from(result.events)
                    .next(SceneStarts,         event => expect(event.details.name).to.equal(new Name('A scenario is marked as skipped at the group level')))
                    .next(SceneTagged,         event => expect(event.tag).to.equal(new FeatureTag('Playwright Test reporting')))
                    .next(TestRunnerDetected,  event => expect(event.name).to.equal(new Name('Playwright')))
                    .next(SceneFinished,       event => expect(event.outcome).to.be.instanceOf(ExecutionSkipped))
                ;
            }));

        it('is marked as conditionally skipped at the group level', () => playwrightTest('--project=default', 'skipped/marked-as-skipped-at-group-level-conditionally.spec.ts')
            .then(ifExitCodeIsOtherThan(0, logOutput))
            .then(result => {

                expect(result.exitCode).to.equal(0);

                PickEvent.from(result.events)
                    .next(SceneStarts,         event => expect(event.details.name).to.equal(new Name('A scenario is marked as conditionally skipped at the group level')))
                    .next(SceneTagged,         event => expect(event.tag).to.equal(new FeatureTag('Playwright Test reporting')))
                    .next(TestRunnerDetected,  event => expect(event.name).to.equal(new Name('Playwright')))
                    .next(SceneFinished,       event => expect(event.outcome).to.be.instanceOf(ExecutionSkipped))
                ;
            }));

        it('is marked as fixme', () => playwrightTest('--project=default', 'skipped/marked-as-fixme.spec.ts')
            .then(ifExitCodeIsOtherThan(0, logOutput))
            .then(result => {

                expect(result.exitCode).to.equal(0);

                PickEvent.from(result.events)
                    .next(SceneStarts,         event => expect(event.details.name).to.equal(new Name('A scenario is marked as fixme')))
                    .next(SceneTagged,         event => expect(event.tag).to.equal(new FeatureTag('Playwright Test reporting')))
                    .next(TestRunnerDetected,  event => expect(event.name).to.equal(new Name('Playwright')))
                    .next(SceneFinished,       event => expect(event.outcome).to.be.instanceOf(ExecutionSkipped))
                ;
            }));
    });
});
