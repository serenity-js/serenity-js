import 'mocha';

import { expect, ifExitCodeIsOtherThan, logOutput, PickEvent } from '@integration/testing-tools';
import { InteractionStarts, SceneFinished, SceneStarts, SceneTagged, TestRunnerDetected } from '@serenity-js/core/lib/events';
import { ExecutionSuccessful, FeatureTag, Name } from '@serenity-js/core/lib/model';
import { protractor } from '../src/protractor';

describe('@serenity-js/jasmine', function () {

    /*
     * See:
     * - https://github.com/angular/protractor/issues/3234
     * - https://github.com/jan-molak/serenity-js/issues/56
     */

    this.timeout(10000);

    it('supports restarting the browser between test scenarios', () =>
        protractor(
            './examples/protractor.conf.js',
            '--specs=examples/multiple_passing_scenarios.spec.js',
            '--restartBrowserBetweenTests',
        )
        .then(ifExitCodeIsOtherThan(0, logOutput))
        .then(res => {

            expect(res.exitCode).to.equal(0);

            PickEvent.from(res.events)
                .next(SceneStarts,         event => expect(event.value.name).to.equal(new Name('A scenario passes the first time')))
                .next(InteractionStarts,   event => expect(event.value.name).to.equal(new Name(`Jasmine disables synchronisation with Angular`)))
                .next(InteractionStarts,   event => expect(event.value.name).to.equal(new Name(`Jasmine navigates to 'chrome://version/'`)))
                .next(SceneFinished,       event => expect(event.outcome).to.equal(new ExecutionSuccessful()))

                .next(SceneStarts,         event => expect(event.value.name).to.equal(new Name('A scenario passes the second time')))
                .next(InteractionStarts,   event => expect(event.value.name).to.equal(new Name(`Jasmine disables synchronisation with Angular`)))
                .next(InteractionStarts,   event => expect(event.value.name).to.equal(new Name(`Jasmine navigates to 'chrome://accessibility/'`)))
                .next(SceneFinished,       event => expect(event.outcome).to.equal(new ExecutionSuccessful()))

                .next(SceneStarts,         event => expect(event.value.name).to.equal(new Name('A scenario passes the third time')))
                .next(InteractionStarts,   event => expect(event.value.name).to.equal(new Name(`Jasmine disables synchronisation with Angular`)))
                .next(InteractionStarts,   event => expect(event.value.name).to.equal(new Name(`Jasmine navigates to 'chrome://chrome-urls/'`)))
                .next(SceneFinished,       event => expect(event.outcome).to.equal(new ExecutionSuccessful()))
            ;
        }));

    it('produces the same result when the browser is not restarted between the tests', () =>
        protractor(
            './examples/protractor.conf.js',
            '--specs=examples/multiple_passing_scenarios.spec.js',
        )
            .then(ifExitCodeIsOtherThan(0, logOutput))
            .then(res => {

                expect(res.exitCode).to.equal(0);

                PickEvent.from(res.events)
                    .next(SceneStarts,         event => expect(event.value.name).to.equal(new Name('A scenario passes the first time')))
                    .next(InteractionStarts,   event => expect(event.value.name).to.equal(new Name(`Jasmine disables synchronisation with Angular`)))
                    .next(InteractionStarts,   event => expect(event.value.name).to.equal(new Name(`Jasmine navigates to 'chrome://version/'`)))
                    .next(SceneFinished,       event => expect(event.outcome).to.equal(new ExecutionSuccessful()))

                    .next(SceneStarts,         event => expect(event.value.name).to.equal(new Name('A scenario passes the second time')))
                    .next(InteractionStarts,   event => expect(event.value.name).to.equal(new Name(`Jasmine disables synchronisation with Angular`)))
                    .next(InteractionStarts,   event => expect(event.value.name).to.equal(new Name(`Jasmine navigates to 'chrome://accessibility/'`)))
                    .next(SceneFinished,       event => expect(event.outcome).to.equal(new ExecutionSuccessful()))

                    .next(SceneStarts,         event => expect(event.value.name).to.equal(new Name('A scenario passes the third time')))
                    .next(InteractionStarts,   event => expect(event.value.name).to.equal(new Name(`Jasmine disables synchronisation with Angular`)))
                    .next(InteractionStarts,   event => expect(event.value.name).to.equal(new Name(`Jasmine navigates to 'chrome://chrome-urls/'`)))
                    .next(SceneFinished,       event => expect(event.outcome).to.equal(new ExecutionSuccessful()))
                ;
            }));
});
