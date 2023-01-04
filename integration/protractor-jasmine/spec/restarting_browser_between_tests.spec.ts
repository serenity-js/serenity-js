import { expect, ifExitCodeIsOtherThan, logOutput, PickEvent } from '@integration/testing-tools';
import { AsyncOperationAttempted, AsyncOperationCompleted, SceneFinished, SceneFinishes, SceneStarts, TestRunFinished } from '@serenity-js/core/lib/events';
import { CorrelationId, Description, ExecutionSuccessful, Name } from '@serenity-js/core/lib/model';
import { describe, it } from 'mocha';

import { protractor } from '../src/protractor';

describe('@serenity-js/jasmine', function () {

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

            let currentSceneId: CorrelationId,
                firstAsyncHooksId: CorrelationId,
                secondAsyncHooksId: CorrelationId,
                thirdAsyncHooksId: CorrelationId;

            PickEvent.from(result.events)
                .next(SceneStarts, event => {
                    expect(event.details.name).to.equal(new Name('A scenario passes the first time'));
                    currentSceneId = event.sceneId;
                })
                .next(SceneFinishes, event => {
                    expect(event.sceneId).to.equal(currentSceneId);
                })
                .next(AsyncOperationAttempted,  event => {
                    expect(event.name).to.equal(new Name('ProtractorReporter'))
                    expect(event.description).to.equal(new Description('Invoking ProtractorRunner.afterEach...'))
                    firstAsyncHooksId = event.correlationId;
                })
                .next(AsyncOperationCompleted,  event => expect(event.correlationId).to.equal(firstAsyncHooksId))
                .next(SceneFinished,            event => {
                    expect(event.sceneId).to.equal(currentSceneId);
                    expect(event.outcome).to.equal(new ExecutionSuccessful());
                })

                .next(SceneStarts,              event => {
                    expect(event.details.name).to.equal(new Name('A scenario passes the second time'));
                    currentSceneId = event.sceneId;
                })
                .next(SceneFinishes,            event => {
                    expect(event.sceneId).to.equal(currentSceneId);
                })
                .next(AsyncOperationAttempted,  event => {
                    expect(event.name).to.equal(new Name('ProtractorReporter'))
                    expect(event.description).to.equal(new Description('Invoking ProtractorRunner.afterEach...'))
                    secondAsyncHooksId = event.correlationId;
                })
                .next(AsyncOperationCompleted,  event => expect(event.correlationId).to.equal(secondAsyncHooksId))
                .next(SceneFinished,            event => {
                    expect(event.sceneId).to.equal(currentSceneId);
                    expect(event.outcome).to.equal(new ExecutionSuccessful())
                })

                .next(SceneStarts,              event => {
                    expect(event.details.name).to.equal(new Name('A scenario passes the third time'));
                    currentSceneId = event.sceneId;
                })
                .next(SceneFinishes,            event => {
                    expect(event.sceneId).to.equal(currentSceneId);
                })
                .next(AsyncOperationAttempted,  event => {
                    expect(event.name).to.equal(new Name('ProtractorReporter'))
                    expect(event.description).to.equal(new Description('Invoking ProtractorRunner.afterEach...'))
                    thirdAsyncHooksId = event.correlationId;
                })
                .next(AsyncOperationCompleted,  event => expect(event.correlationId).to.equal(thirdAsyncHooksId))
                .next(SceneFinished,            event => {
                    expect(event.sceneId).to.equal(currentSceneId);
                    expect(event.outcome).to.equal(new ExecutionSuccessful())
                })

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

            let currentSceneId: CorrelationId,
                firstAsyncHooksId: CorrelationId,
                secondAsyncHooksId: CorrelationId,
                thirdAsyncHooksId: CorrelationId;

            PickEvent.from(result.events)
                .next(SceneStarts,              event => {
                    expect(event.details.name).to.equal(new Name('A scenario passes the first time'));
                    currentSceneId = event.sceneId;
                })
                .next(SceneFinishes,            event => {
                    expect(event.sceneId).to.equal(currentSceneId);
                })
                .next(AsyncOperationAttempted,  event => {
                    expect(event.name).to.equal(new Name('ProtractorReporter'))
                    expect(event.description).to.equal(new Description('Invoking ProtractorRunner.afterEach...'))
                    firstAsyncHooksId = event.correlationId;
                })
                .next(AsyncOperationCompleted,  event => expect(event.correlationId).to.equal(firstAsyncHooksId))
                .next(SceneFinished,            event => {
                    expect(event.sceneId).to.equal(currentSceneId);
                    expect(event.outcome).to.equal(new ExecutionSuccessful());
                })

                .next(SceneStarts,              event => {
                    expect(event.details.name).to.equal(new Name('A scenario passes the second time'));
                    currentSceneId = event.sceneId;
                })
                .next(SceneFinishes,            event => {
                    expect(event.sceneId).to.equal(currentSceneId);
                })
                .next(AsyncOperationAttempted,  event => {
                    expect(event.name).to.equal(new Name('ProtractorReporter'))
                    expect(event.description).to.equal(new Description('Invoking ProtractorRunner.afterEach...'))
                    secondAsyncHooksId = event.correlationId;
                })
                .next(AsyncOperationCompleted,  event => expect(event.correlationId).to.equal(secondAsyncHooksId))
                .next(SceneFinished,            event => {
                    expect(event.sceneId).to.equal(currentSceneId);
                    expect(event.outcome).to.equal(new ExecutionSuccessful());
                })

                .next(SceneStarts,              event => {
                    expect(event.details.name).to.equal(new Name('A scenario passes the third time'));
                    currentSceneId = event.sceneId;
                })
                .next(SceneFinishes,            event => {
                    expect(event.sceneId).to.equal(currentSceneId);
                })
                .next(AsyncOperationAttempted,  event => {
                    expect(event.name).to.equal(new Name('ProtractorReporter'))
                    expect(event.description).to.equal(new Description('Invoking ProtractorRunner.afterEach...'))
                    thirdAsyncHooksId = event.correlationId;
                })
                .next(AsyncOperationCompleted,  event => expect(event.correlationId).to.equal(thirdAsyncHooksId))
                .next(SceneFinished,            event => {
                    expect(event.sceneId).to.equal(currentSceneId);
                    expect(event.outcome).to.equal(new ExecutionSuccessful());
                })

                .next(TestRunFinished,          event => expect(event.timestamp).to.not.be.undefined)
            ;
        }));
});
