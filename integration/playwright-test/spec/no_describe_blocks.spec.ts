import { expect, ifExitCodeIsOtherThan, logOutput, PickEvent } from '@integration/testing-tools';
import { Timestamp } from '@serenity-js/core';
import { SceneStarts, SceneTagged, TestRunFinished, TestRunFinishes, TestRunnerDetected, TestRunStarts } from '@serenity-js/core/lib/events';
import { Category, FeatureTag, Name } from '@serenity-js/core/lib/model';
import { describe, it } from 'mocha';

import { playwrightTest } from '../src/playwright-test';

describe('@serenity-js/playwright-test', function () {

    describe('when no describe blocks are used', () => {

        it('uses file path as feature name', () => playwrightTest('--project=default', './no-describe-blocks.spec.ts')
            .then(ifExitCodeIsOtherThan(0, logOutput))
            .then(result => {

                expect(result.exitCode).to.equal(0);

                PickEvent.from(result.events)
                    .next(TestRunStarts,       event => expect(event.timestamp).to.be.instanceof(Timestamp))
                    .next(SceneStarts,         event => {
                        expect(event.details.name).to.equal(new Name('has no describe blocks'));
                        expect(event.details.category).to.equal(new Category('no-describe-blocks.spec.ts'));
                    })
                    .next(SceneTagged,         event => expect(event.tag).to.equal(new FeatureTag('no-describe-blocks.spec.ts')))
                    .next(TestRunnerDetected,  event => expect(event.name).to.equal(new Name('Playwright')))

                    .next(TestRunFinishes,     event => expect(event.timestamp).to.be.instanceof(Timestamp))
                    .next(TestRunFinished,     event => expect(event.timestamp).to.be.instanceof(Timestamp))
                ;
            }));

        it('uses nested file path as feature name', () => playwrightTest('--project=default', './nested/another-no-describe-blocks.spec.ts')
            .then(ifExitCodeIsOtherThan(0, logOutput))
            .then(result => {

                expect(result.exitCode).to.equal(0);

                PickEvent.from(result.events)
                    .next(TestRunStarts,       event => expect(event.timestamp).to.be.instanceof(Timestamp))

                    .next(SceneStarts,         event => {
                        expect(event.details.name).to.equal(new Name('has no describe blocks'));
                        expect(event.details.category).to.equal(new Category('nested/another-no-describe-blocks.spec.ts'));
                    })
                    .next(SceneTagged,         event => expect(event.tag).to.equal(new FeatureTag('nested/another-no-describe-blocks.spec.ts')))
                    .next(TestRunnerDetected,  event => expect(event.name).to.equal(new Name('Playwright')))

                    .next(TestRunFinishes,     event => expect(event.timestamp).to.be.instanceof(Timestamp))
                    .next(TestRunFinished,     event => expect(event.timestamp).to.be.instanceof(Timestamp))
                ;
            }));
    });
});
