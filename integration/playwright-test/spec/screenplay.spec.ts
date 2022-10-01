import { expect, ifExitCodeIsOtherThan, logOutput, PickEvent } from '@integration/testing-tools';
import { AsyncOperationAttempted, AsyncOperationCompleted, InteractionFinished, InteractionStarts, SceneFinished, SceneStarts, SceneTagged, TestRunnerDetected } from '@serenity-js/core/lib/events';
import { CorrelationId, Description, ExecutionFailedWithAssertionError, ExecutionFailedWithError, ExecutionSuccessful, FeatureTag, Name, ProblemIndication } from '@serenity-js/core/lib/model';
import { describe, it } from 'mocha';

import { playwrightTest } from '../src/playwright-test';

describe('@serenity-js/playwright-test', function () {

    this.timeout(60 * 1000);

    describe('reports events that occur when a Screenplay Pattern scenario', () => {

        it('passes with a single actor', () =>
            playwrightTest('screenplay/passing-single-actor.spec.ts')
                .then(ifExitCodeIsOtherThan(0, logOutput))
                .then(result => {

                    expect(result.exitCode).to.equal(0);

                    let currentSceneId: CorrelationId;

                    PickEvent.from(result.events)
                        .next(SceneStarts,         event => {
                            expect(event.details.name).to.equal(new Name('A screenplay scenario propagates events to Serenity reporter'));
                            currentSceneId = event.sceneId
                        })
                        .next(SceneTagged,         event => expect(event.tag).to.equal(new FeatureTag('Playwright Test reporting')))
                        .next(TestRunnerDetected,  event => expect(event.name).to.equal(new Name('Playwright')))
                        .next(InteractionStarts,   event => {
                            expect(event.details.name).to.equal(new Name(`Alice logs: 'Hello world'`));
                            expect(event.sceneId).to.equal(currentSceneId);
                        })
                        .next(InteractionFinished,   event => {
                            expect(event.details.name).to.equal(new Name(`Alice logs: 'Hello world'`));
                            expect(event.sceneId).to.equal(currentSceneId);
                        })
                        .next(AsyncOperationAttempted,   event => {
                            expect(event.taskDescription).to.equal(new Description(`[Stage] Dismissing Alice...`));
                        })
                        .next(AsyncOperationCompleted,   event => {
                            expect(event.taskDescription).to.equal(new Description(`[Stage] Dismissed Alice successfully`));
                        })
                        .next(SceneFinished,       event => expect(event.outcome).to.be.instanceOf(ExecutionSuccessful))
                    ;
                }));

        it('passes with multiple actor', () =>
            playwrightTest('screenplay/passing-multiple-actors.spec.ts')
                .then(ifExitCodeIsOtherThan(0, logOutput))
                .then(result => {

                    expect(result.exitCode).to.equal(0);

                    PickEvent.from(result.events)
                        .next(SceneStarts,         event => {
                            expect(event.details.name).to.equal(new Name('A screenplay scenario supports multiple actors'))
                        })
                        .next(SceneTagged,         event => expect(event.tag).to.equal(new FeatureTag('Playwright Test reporting')))
                        .next(TestRunnerDetected,  event => expect(event.name).to.equal(new Name('Playwright')))
                        
                    // we already know reporting interactions work, so let's focus on dismissing the actors
                        
                        .next(AsyncOperationAttempted,   event => {
                            expect(event.taskDescription).to.equal(new Description(`[Stage] Dismissing Charlie...`));
                        })
                        .next(AsyncOperationAttempted,   event => {
                            expect(event.taskDescription).to.equal(new Description(`[Stage] Dismissing Alice...`));
                        })
                        .next(AsyncOperationAttempted,   event => {
                            expect(event.taskDescription).to.equal(new Description(`[Stage] Dismissing Bob...`));
                        })
                        .next(AsyncOperationCompleted,   event => {
                            expect(event.taskDescription).to.equal(new Description(`[Stage] Dismissed Charlie successfully`));
                        })
                        .next(AsyncOperationCompleted,   event => {
                            expect(event.taskDescription).to.equal(new Description(`[Stage] Dismissed Alice successfully`));
                        })
                        .next(AsyncOperationCompleted,   event => {
                            expect(event.taskDescription).to.equal(new Description(`[Stage] Dismissed Bob successfully`));
                        })
                        .next(SceneFinished,       event => expect(event.outcome).to.be.instanceOf(ExecutionSuccessful))
                    ;
                }));

        it('fails because of a failing Screenplay expectation', () =>
            playwrightTest('screenplay/assertion-error.spec.ts')
                .then(ifExitCodeIsOtherThan(1, logOutput))
                .then(result => {

                    expect(result.exitCode).to.equal(1);

                    PickEvent.from(result.events)
                        .next(SceneStarts,         event => expect(event.details.name).to.equal(new Name('A screenplay scenario correctly reports assertion errors')))
                        .next(SceneTagged,         event => expect(event.tag).to.equal(new FeatureTag('Playwright Test reporting')))
                        .next(TestRunnerDetected,  event => expect(event.name).to.equal(new Name('Playwright')))
                        .next(SceneFinished,       event => {
                            const outcome: ProblemIndication = event.outcome as ProblemIndication;

                            expect(outcome).to.be.instanceOf(ExecutionFailedWithAssertionError);
                            expect(outcome.error.name).to.equal('AssertionError');
                            expect(outcome.error.message).to.equal('Expected false to equal true');
                        })
                    ;
                }));

        it('fails when discarding an ability results in Error', () =>
            playwrightTest('screenplay/ability-discard-error.spec.ts')
                .then(ifExitCodeIsOtherThan(1, logOutput))
                .then(result => {
                    expect(result.exitCode).to.equal(1);

                    PickEvent.from(result.events)
                        .next(SceneStarts,         event => expect(event.details.name).to.equal(new Name('A screenplay scenario fails when discarding an ability fails')))
                        .next(SceneTagged,         event => expect(event.tag).to.equal(new FeatureTag('Playwright Test reporting')))
                        .next(TestRunnerDetected,  event => expect(event.name).to.equal(new Name('Playwright')))
                        .next(SceneFinished,       event => {
                            const outcome: ProblemIndication = event.outcome as ProblemIndication;

                            expect(outcome).to.be.instanceOf(ExecutionFailedWithError);
                            expect(outcome.error.name).to.equal('Error');

                            const message = outcome.error.message.split('\n');

                            expect(message[0]).to.equal('1 async operation has failed to complete:');
                            expect(message[1]).to.equal('[Stage] Dismissing Donald... - TypeError: Some internal error in ability');
                        })
                    ;
                }));

        it(`fails when discarding an ability doesn't complete within a timeout`, () =>
            playwrightTest('screenplay/ability-discard-timeout.spec.ts')
                .then(ifExitCodeIsOtherThan(1, logOutput))
                .then(result => {
                    expect(result.exitCode).to.equal(1);

                    PickEvent.from(result.events)
                        .next(SceneStarts,         event => expect(event.details.name).to.equal(new Name('A screenplay scenario fails when discarding an ability fails')))
                        .next(SceneTagged,         event => expect(event.tag).to.equal(new FeatureTag('Playwright Test reporting')))
                        .next(TestRunnerDetected,  event => expect(event.name).to.equal(new Name('Playwright')))
                        .next(SceneFinished,       event => {
                            const outcome: ProblemIndication = event.outcome as ProblemIndication;

                            expect(outcome).to.be.instanceOf(ExecutionFailedWithError);
                            expect(outcome.error.name).to.equal('Error');

                            const message = outcome.error.message.split('\n');

                            expect(message[0]).to.equal('1 async operation has failed to complete within a 50ms cue timeout:');
                            expect(message[1]).to.match(/\d+ms - \[Stage] Dismissing Donald\.\.\./);
                        })
                    ;
                }));

        it(`executes all the scenarios in the test suite even when some of them fail because of an error when discarding an ability`, () =>
            playwrightTest('screenplay/ability-discard-error-should-not-affect-stage-cue.spec.ts')
                .then(ifExitCodeIsOtherThan(1, logOutput))
                .then(result => {
                    expect(result.exitCode).to.equal(1);

                    PickEvent.from(result.events)
                        .next(SceneStarts,         event => expect(event.details.name).to.equal(new Name('A screenplay scenario fails when discarding an ability fails')))
                        .next(SceneFinished,       event => {
                            const outcome: ProblemIndication = event.outcome as ProblemIndication;

                            expect(outcome).to.be.instanceOf(ExecutionFailedWithError);
                            expect(outcome.error.name).to.equal('Error');

                            const message = outcome.error.message.split('\n');

                            expect(message[0]).to.equal('1 async operation has failed to complete:');
                            expect(message[1]).to.equal('[Stage] Dismissing Donald... - TypeError: Some internal error in ability');
                        })
                        .next(SceneStarts,         event => expect(event.details.name).to.equal(new Name('A screenplay scenario succeeds when ability is discarded successfully')))
                        .next(SceneFinished,       event => {
                            expect(event.outcome).to.be.instanceOf(ExecutionSuccessful);
                        })
                        .next(SceneStarts,         event => expect(event.details.name).to.equal(new Name('A screenplay scenario fails if the ability fails to discard again')))
                        .next(SceneFinished,       event => {
                            const outcome: ProblemIndication = event.outcome as ProblemIndication;

                            expect(outcome).to.be.instanceOf(ExecutionFailedWithError);
                            expect(outcome.error.name).to.equal('Error');

                            const message = outcome.error.message.split('\n');

                            expect(message[0]).to.equal('1 async operation has failed to complete:');
                            expect(message[1]).to.equal('[Stage] Dismissing Donald... - TypeError: Some internal error in ability');
                        })
                    ;
                }));
    });
});
