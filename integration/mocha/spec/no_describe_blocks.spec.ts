import { expect, ifExitCodeIsOtherThan, logOutput, PickEvent } from '@integration/testing-tools';
import { Timestamp } from '@serenity-js/core';
import { SceneStarts, SceneTagged, TestRunFinished, TestRunFinishes, TestRunnerDetected, TestRunStarts } from '@serenity-js/core/lib/events';
import { Category, FeatureTag, Name } from '@serenity-js/core/lib/model';
import { describe, it } from 'mocha';

import { mocha } from '../src/mocha';

describe('@serenity-js/mocha', function () {

    describe('when no describe blocks are used', () => {

        it('uses file path as feature name', () => mocha('examples/no-describe-blocks.spec.js')
            .then(ifExitCodeIsOtherThan(0, logOutput))
            .then(result => {

                expect(result.exitCode).to.equal(0);

                PickEvent.from(result.events)
                    .next(TestRunStarts,       event => expect(event.timestamp).to.be.instanceof(Timestamp))
                    .next(SceneStarts,         event => {
                        expect(event.details.name).to.equal(new Name('has no describe blocks'));
                        expect(event.details.category).to.equal(new Category('examples/no-describe-blocks.spec.js'));
                    })
                    .next(SceneTagged,         event => expect(event.tag).to.equal(new FeatureTag('examples/no-describe-blocks.spec.js')))
                    .next(TestRunnerDetected,  event => expect(event.name).to.equal(new Name('Mocha')))

                    .next(TestRunFinishes,     event => expect(event.timestamp).to.be.instanceof(Timestamp))
                    .next(TestRunFinished,     event => expect(event.timestamp).to.be.instanceof(Timestamp))
                ;
            }));

        it('uses nested file path as feature name', () => mocha('examples/nested/another-no-describe-blocks.spec.js')
            .then(ifExitCodeIsOtherThan(0, logOutput))
            .then(result => {

                expect(result.exitCode).to.equal(0);

                PickEvent.from(result.events)
                    .next(TestRunStarts,       event => expect(event.timestamp).to.be.instanceof(Timestamp))

                    .next(SceneStarts,         event => {
                        expect(event.details.name).to.equal(new Name('has no describe blocks'));
                        expect(event.details.category).to.equal(new Category('examples/nested/another-no-describe-blocks.spec.js'));
                    })
                    .next(SceneTagged,         event => expect(event.tag).to.equal(new FeatureTag('examples/nested/another-no-describe-blocks.spec.js')))
                    .next(TestRunnerDetected,  event => expect(event.name).to.equal(new Name('Mocha')))

                    .next(TestRunFinishes,     event => expect(event.timestamp).to.be.instanceof(Timestamp))
                    .next(TestRunFinished,     event => expect(event.timestamp).to.be.instanceof(Timestamp))
                ;
            }));
    });
});
