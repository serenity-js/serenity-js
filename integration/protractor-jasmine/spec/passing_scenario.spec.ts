import 'mocha';

import { expect, ifExitCodeIsOtherThan, logOutput, PickEvent } from '@integration/testing-tools';
import { SceneFinished, SceneStarts, SceneTagged, TestRunnerDetected } from '@serenity-js/core/lib/events';
import { ExecutionSuccessful, FeatureTag, Name } from '@serenity-js/core/lib/model';
import { protractor } from '../src/protractor';

describe('@serenity-js/jasmine', function () {

    this.timeout(30000);

    it('recognises a passing scenario', () =>
        protractor(
            './examples/protractor.conf.js',
            '--specs=examples/passing.spec.js',
        )
        .then(ifExitCodeIsOtherThan(0, logOutput))
        .then(res => {

            expect(res.exitCode).to.equal(0);

            PickEvent.from(res.events)
                .next(SceneStarts,         event => expect(event.details.name).to.equal(new Name('A scenario passes')))
                .next(SceneTagged,         event => expect(event.tag).to.equal(new FeatureTag('Jasmine')))
                .next(TestRunnerDetected,  event => expect(event.value).to.equal(new Name('Jasmine')))
                .next(SceneFinished,       event => expect(event.outcome).to.equal(new ExecutionSuccessful()))
            ;
        }));
});
