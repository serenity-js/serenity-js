import 'mocha';

import { expect, ifExitCodeIsOtherThan, logOutput, PickEvent } from '@integration/testing-tools';
import {
    SceneFinished,
    SceneFinishes,
    SceneStarts,
    SceneTagged,
    TestRunFinished,
    TestRunFinishes,
    TestRunnerDetected,
    TestRunStarts,
    TestSuiteFinished,
    TestSuiteStarts,
} from '@serenity-js/core/lib/events';
import { ExecutionFailedWithAssertionError, ExecutionSuccessful, FeatureTag, Name, Timestamp } from '@serenity-js/core/lib/model';
import { mocha } from '../src/mocha';

describe('@serenity-js/mocha', function () {

    this.timeout(15000);

    it('recognises nested suites', () => mocha('examples/suites.spec.js')
        .then(ifExitCodeIsOtherThan(1, logOutput))
        .then(res => {

            expect(res.exitCode).to.equal(1);

            PickEvent.from(res.events)
                .next(TestRunStarts,       event => expect(event.timestamp).to.be.instanceof(Timestamp))

                .next(TestSuiteStarts,     event => expect(event.details.name).to.equal(new Name('Mocha reporting')))
                .next(TestSuiteStarts,     event => expect(event.details.name).to.equal(new Name('level 1 suite')))
                .next(SceneStarts,         event => expect(event.details.name).to.equal(new Name('level 1 suite fails with an assertion error')))
                .next(SceneTagged,         event => expect(event.tag).to.equal(new FeatureTag('Mocha reporting')))
                .next(TestRunnerDetected,  event => expect(event.name).to.equal(new Name('Mocha')))
                .next(SceneFinishes,       event => expect(event.details.name).to.equal(new Name('level 1 suite fails with an assertion error')))
                .next(SceneFinished,       event => expect(event.outcome).to.be.instanceof(ExecutionFailedWithAssertionError))

                .next(TestSuiteStarts,     event => expect(event.details.name).to.equal(new Name('level 2 suite')))
                .next(SceneStarts,         event => expect(event.details.name).to.equal(new Name('level 1 suite level 2 suite passes')))
                .next(SceneTagged,         event => expect(event.tag).to.equal(new FeatureTag('Mocha reporting')))
                .next(TestRunnerDetected,  event => expect(event.name).to.equal(new Name('Mocha')))
                .next(SceneFinishes,       event => expect(event.details.name).to.equal(new Name('level 1 suite level 2 suite passes')))
                .next(SceneFinished,       event => expect(event.outcome).to.equal(new ExecutionSuccessful()))

                .next(TestSuiteFinished,   event => {
                    expect(event.details.name).to.equal(new Name('level 2 suite'))
                    expect(event.outcome).to.be.instanceof(ExecutionSuccessful)
                })

                .next(TestSuiteFinished,   event => {
                    expect(event.details.name).to.equal(new Name('level 1 suite'))
                    expect(event.outcome).to.be.instanceof(ExecutionFailedWithAssertionError)
                })

                .next(TestSuiteFinished,   event => {
                    expect(event.details.name).to.equal(new Name('Mocha reporting'))
                    expect(event.outcome).to.be.instanceof(ExecutionSuccessful)
                })

                .next(TestRunFinishes,     event => expect(event.timestamp).to.be.instanceof(Timestamp))
                .next(TestRunFinished,     event => expect(event.timestamp).to.be.instanceof(Timestamp))
            ;
        }));
});
