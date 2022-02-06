import 'mocha';

import { expect, ifExitCodeIsOtherThan, logOutput, PickEvent } from '@integration/testing-tools';
import { AsyncOperationAttempted, AsyncOperationCompleted, InteractionStarts, SceneFinished, SceneFinishes, SceneStarts, TestRunFinished } from '@serenity-js/core/lib/events';
import { Description, ExecutionSuccessful, Name } from '@serenity-js/core/lib/model';

import { protractor } from '../src/protractor';

describe('@serenity-js/Mocha', function () {

    /*
     * See:
     * - https://github.com/angular/protractor/issues/3234
     * - https://github.com/jan-molak/serenity-js/issues/56
     */

    this.timeout(60000);

    it('supports restarting the browser between test scenarios', () =>
        protractor(
            './examples/protractor.conf.js',
            '--specs=examples/multiple_passing_scenarios.spec.js',
            '--restartBrowserBetweenTests',
        )
        .then(ifExitCodeIsOtherThan(0, logOutput))
        .then(result => {

            expect(result.exitCode).to.equal(0);

            PickEvent.from(result.events)
                .next(SceneStarts,              event => expect(event.details.name).to.equal(new Name('A scenario passes the first time')))
                .next(InteractionStarts,        event => expect(event.details.name).to.equal(new Name(`Mocha disables synchronisation with Angular`)))
                .next(InteractionStarts,        event => expect(event.details.name).to.equal(new Name(`Mocha navigates to 'chrome://version/'`)))
                .next(SceneFinishes,            event => expect(event.details.name).to.equal(new Name('A scenario passes the first time')))
                .next(AsyncOperationAttempted,  event => expect(event.taskDescription).to.equal(new Description('[ProtractorReporter] Invoking ProtractorRunner.afterEach...')))
                .next(AsyncOperationAttempted,  event => expect(event.taskDescription).to.equal(new Description('[Stage] Dismissing Mocha...')))
                .next(AsyncOperationCompleted,  event => expect(event.taskDescription).to.equal(new Description('[Stage] Dismissed Mocha successfully')))
                .next(AsyncOperationCompleted,  event => expect(event.taskDescription).to.equal(new Description('[ProtractorReporter] ProtractorRunner.afterEach succeeded')))
                .next(SceneFinished,            event => expect(event.outcome).to.equal(new ExecutionSuccessful()))

                .next(SceneStarts,              event => expect(event.details.name).to.equal(new Name('A scenario passes the second time')))
                .next(InteractionStarts,        event => expect(event.details.name).to.equal(new Name(`Mocha disables synchronisation with Angular`)))
                .next(InteractionStarts,        event => expect(event.details.name).to.equal(new Name(`Mocha navigates to 'chrome://accessibility/'`)))
                .next(SceneFinishes,            event => expect(event.details.name).to.equal(new Name('A scenario passes the second time')))
                .next(AsyncOperationAttempted,  event => expect(event.taskDescription).to.equal(new Description('[ProtractorReporter] Invoking ProtractorRunner.afterEach...')))
                .next(AsyncOperationAttempted,  event => expect(event.taskDescription).to.equal(new Description('[Stage] Dismissing Mocha...')))
                .next(AsyncOperationCompleted,  event => expect(event.taskDescription).to.equal(new Description('[Stage] Dismissed Mocha successfully')))
                .next(AsyncOperationCompleted,  event => expect(event.taskDescription).to.equal(new Description('[ProtractorReporter] ProtractorRunner.afterEach succeeded')))
                .next(SceneFinished,            event => expect(event.outcome).to.equal(new ExecutionSuccessful()))

                .next(SceneStarts,              event => expect(event.details.name).to.equal(new Name('A scenario passes the third time')))
                .next(InteractionStarts,        event => expect(event.details.name).to.equal(new Name(`Mocha disables synchronisation with Angular`)))
                .next(InteractionStarts,        event => expect(event.details.name).to.equal(new Name(`Mocha navigates to 'chrome://chrome-urls/'`)))
                .next(SceneFinishes,            event => expect(event.details.name).to.equal(new Name('A scenario passes the third time')))
                .next(AsyncOperationAttempted,  event => expect(event.taskDescription).to.equal(new Description('[ProtractorReporter] Invoking ProtractorRunner.afterEach...')))
                .next(AsyncOperationAttempted,  event => expect(event.taskDescription).to.equal(new Description('[Stage] Dismissing Mocha...')))
                .next(AsyncOperationCompleted,  event => expect(event.taskDescription).to.equal(new Description('[Stage] Dismissed Mocha successfully')))
                .next(AsyncOperationCompleted,  event => expect(event.taskDescription).to.equal(new Description('[ProtractorReporter] ProtractorRunner.afterEach succeeded')))
                .next(SceneFinished,            event => expect(event.outcome).to.equal(new ExecutionSuccessful()))

                .next(TestRunFinished,          event => expect(event.timestamp).to.not.be.undefined)
            ;
        }));

    it('produces the same result when the browser is not restarted between the tests', () =>
        protractor(
            './examples/protractor.conf.js',
            '--specs=examples/multiple_passing_scenarios.spec.js',
        )
        .then(ifExitCodeIsOtherThan(0, logOutput))
        .then(result => {

            expect(result.exitCode).to.equal(0);

            PickEvent.from(result.events)
                .next(SceneStarts,              event => expect(event.details.name).to.equal(new Name('A scenario passes the first time')))
                .next(InteractionStarts,        event => expect(event.details.name).to.equal(new Name(`Mocha disables synchronisation with Angular`)))
                .next(InteractionStarts,        event => expect(event.details.name).to.equal(new Name(`Mocha navigates to 'chrome://version/'`)))
                .next(SceneFinishes,            event => expect(event.details.name).to.equal(new Name('A scenario passes the first time')))
                .next(AsyncOperationAttempted,  event => expect(event.taskDescription).to.equal(new Description('[ProtractorReporter] Invoking ProtractorRunner.afterEach...')))
                .next(AsyncOperationAttempted,  event => expect(event.taskDescription).to.equal(new Description('[Stage] Dismissing Mocha...')))
                .next(AsyncOperationCompleted,  event => expect(event.taskDescription).to.equal(new Description('[Stage] Dismissed Mocha successfully')))
                .next(AsyncOperationCompleted,  event => expect(event.taskDescription).to.equal(new Description('[ProtractorReporter] ProtractorRunner.afterEach succeeded')))
                .next(SceneFinished,            event => expect(event.outcome).to.equal(new ExecutionSuccessful()))

                .next(SceneStarts,              event => expect(event.details.name).to.equal(new Name('A scenario passes the second time')))
                .next(InteractionStarts,        event => expect(event.details.name).to.equal(new Name(`Mocha disables synchronisation with Angular`)))
                .next(InteractionStarts,        event => expect(event.details.name).to.equal(new Name(`Mocha navigates to 'chrome://accessibility/'`)))
                .next(SceneFinishes,            event => expect(event.details.name).to.equal(new Name('A scenario passes the second time')))
                .next(AsyncOperationAttempted,  event => expect(event.taskDescription).to.equal(new Description('[ProtractorReporter] Invoking ProtractorRunner.afterEach...')))
                .next(AsyncOperationAttempted,  event => expect(event.taskDescription).to.equal(new Description('[Stage] Dismissing Mocha...')))
                .next(AsyncOperationCompleted,  event => expect(event.taskDescription).to.equal(new Description('[Stage] Dismissed Mocha successfully')))
                .next(AsyncOperationCompleted,  event => expect(event.taskDescription).to.equal(new Description('[ProtractorReporter] ProtractorRunner.afterEach succeeded')))
                .next(SceneFinished,            event => expect(event.outcome).to.equal(new ExecutionSuccessful()))

                .next(SceneStarts,              event => expect(event.details.name).to.equal(new Name('A scenario passes the third time')))
                .next(InteractionStarts,        event => expect(event.details.name).to.equal(new Name(`Mocha disables synchronisation with Angular`)))
                .next(InteractionStarts,        event => expect(event.details.name).to.equal(new Name(`Mocha navigates to 'chrome://chrome-urls/'`)))
                .next(SceneFinishes,            event => expect(event.details.name).to.equal(new Name('A scenario passes the third time')))
                .next(AsyncOperationAttempted,  event => expect(event.taskDescription).to.equal(new Description('[ProtractorReporter] Invoking ProtractorRunner.afterEach...')))
                .next(AsyncOperationAttempted,  event => expect(event.taskDescription).to.equal(new Description('[Stage] Dismissing Mocha...')))
                .next(AsyncOperationCompleted,  event => expect(event.taskDescription).to.equal(new Description('[Stage] Dismissed Mocha successfully')))
                .next(AsyncOperationCompleted,  event => expect(event.taskDescription).to.equal(new Description('[ProtractorReporter] ProtractorRunner.afterEach succeeded')))
                .next(SceneFinished,            event => expect(event.outcome).to.equal(new ExecutionSuccessful()))

                .next(TestRunFinished,          event => expect(event.timestamp).to.not.be.undefined)
            ;
        }));
});
