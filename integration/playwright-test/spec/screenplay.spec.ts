import { expect, ifExitCodeIsOtherThan, logOutput, PickEvent } from '@integration/testing-tools';
import {
    ActorStageExitAttempted,
    ActorStageExitCompleted,
    InteractionFinished,
    InteractionStarts,
    SceneFinished,
    SceneStarts,
    SceneTagged,
    TestRunnerDetected
} from '@serenity-js/core/lib/events';
import { trimmed } from '@serenity-js/core/lib/io';
import {
    CapabilityTag,
    CorrelationId,
    Description,
    ExecutionFailedWithAssertionError,
    ExecutionFailedWithError,
    ExecutionSuccessful,
    FeatureTag,
    Name,
    ProblemIndication
} from '@serenity-js/core/lib/model';
import { describe, it } from 'mocha';

import { playwrightTest } from '../src/playwright-test';

describe('@serenity-js/playwright-test', function () {

    this.timeout(60 * 1000);

    describe('reports events that occur when a Screenplay Pattern scenario', () => {

        it('passes with a single actor', async () => {
            const result = await playwrightTest(
                '--project=default',
                'screenplay/passing-single-actor.spec.ts'
            ).then(ifExitCodeIsOtherThan(0, logOutput));

            expect(result.exitCode).to.equal(0);

            let currentSceneId: CorrelationId,
                asyncOperationIdAlice: CorrelationId;

            PickEvent.from(result.events)
                .next(SceneStarts,         event => {
                    expect(event.details.name).to.equal(new Name('A screenplay scenario propagates events to Serenity reporter'));
                    currentSceneId = event.sceneId
                })
                .next(TestRunnerDetected,  event => expect(event.name).to.equal(new Name('Playwright')))
                .next(SceneTagged,         event => expect(event.tag).to.equal(new CapabilityTag('Screenplay')))
                .next(SceneTagged,         event => expect(event.tag).to.equal(new FeatureTag('Playwright Test reporting')))
                .next(InteractionStarts,   event => {
                    expect(event.details.name).to.equal(new Name(`Alice logs: 'Hello world'`));
                    expect(event.sceneId).to.equal(currentSceneId);
                })
                .next(InteractionFinished,   event => {
                    expect(event.details.name).to.equal(new Name(`Alice logs: 'Hello world'`));
                    expect(event.sceneId).to.equal(currentSceneId);
                })
                .next(ActorStageExitAttempted,   event => {
                    expect(event.name).to.equal(new Name(`Stage`));
                    expect(event.description).to.equal(new Description(`Actor Alice exits the stage`));

                    asyncOperationIdAlice = event.correlationId;
                })
                .next(ActorStageExitCompleted,   event => {
                    expect(asyncOperationIdAlice).to.be.instanceOf(CorrelationId);
                    expect(event.correlationId).to.equal(asyncOperationIdAlice);
                })
                .next(SceneFinished,       event => expect(event.outcome).to.be.instanceOf(ExecutionSuccessful))
            ;
        });

        it('passes with multiple actors', async () => {
            const result = await playwrightTest('--project=default', 'screenplay/passing-multiple-actors.spec.ts')
                .then(ifExitCodeIsOtherThan(0, logOutput));

            expect(result.exitCode).to.equal(0);

            let asyncOperationIdAlice: CorrelationId,
                asyncOperationIdBob: CorrelationId,
                asyncOperationIdCharlie: CorrelationId;

            PickEvent.from(result.events)
                .next(SceneStarts, event => {
                    expect(event.details.name).to.equal(new Name('A screenplay scenario supports multiple actors'))
                })
                .next(TestRunnerDetected, event => expect(event.name).to.equal(new Name('Playwright')))
                .next(SceneTagged, event => expect(event.tag).to.equal(new CapabilityTag('Screenplay')))
                .next(SceneTagged, event => expect(event.tag).to.equal(new FeatureTag('Playwright Test reporting')))

                // we already know reporting interactions work, so let's focus on dismissing the actors
                .next(ActorStageExitAttempted, event => {
                    expect(event.name).to.equal(new Name(`Stage`));
                    expect(event.description).to.equal(new Description(`Actor Charlie exits the stage`));

                    asyncOperationIdCharlie = event.correlationId;
                })
                .next(ActorStageExitAttempted, event => {
                    expect(event.name).to.equal(new Name(`Stage`));
                    expect(event.description).to.equal(new Description(`Actor Alice exits the stage`));

                    asyncOperationIdAlice = event.correlationId;
                })
                .next(ActorStageExitAttempted, event => {
                    expect(event.name).to.equal(new Name(`Stage`));
                    expect(event.description).to.equal(new Description(`Actor Bob exits the stage`));

                    asyncOperationIdBob = event.correlationId;
                })
                .next(ActorStageExitCompleted, event => {
                    expect(asyncOperationIdCharlie).to.be.instanceOf(CorrelationId);
                    expect(event.correlationId).to.equal(asyncOperationIdCharlie);
                })
                .next(ActorStageExitCompleted, event => {
                    expect(asyncOperationIdAlice).to.be.instanceOf(CorrelationId);
                    expect(event.correlationId).to.equal(asyncOperationIdAlice);
                })
                .next(ActorStageExitCompleted, event => {
                    expect(asyncOperationIdBob).to.be.instanceOf(CorrelationId);
                    expect(event.correlationId).to.equal(asyncOperationIdBob);
                })
                .next(SceneFinished, event => expect(event.outcome).to.be.instanceOf(ExecutionSuccessful))
            ;
        });

        it('fails because of a failing Screenplay expectation', async () => {
            const result = await playwrightTest('--project=default', 'screenplay/assertion-error.spec.ts')
                .then(ifExitCodeIsOtherThan(1, logOutput));

            expect(result.exitCode).to.equal(1);

            PickEvent.from(result.events)
                .next(SceneStarts, event => expect(event.details.name).to.equal(new Name('A screenplay scenario correctly reports assertion errors')))
                .next(TestRunnerDetected, event => expect(event.name).to.equal(new Name('Playwright')))
                .next(SceneTagged, event => expect(event.tag).to.equal(new CapabilityTag('Screenplay')))
                .next(SceneTagged, event => expect(event.tag).to.equal(new FeatureTag('Playwright Test reporting')))
                .next(SceneFinished, event => {
                    const outcome: ProblemIndication = event.outcome as ProblemIndication;

                    expect(outcome).to.be.instanceOf(ExecutionFailedWithAssertionError);
                    expect(outcome.error.name).to.equal('AssertionError');
                    expect(outcome.error.message).to.match(new RegExp(trimmed`
                        | Expected false to equal true
                        |
                        | Expectation: equals\\(true\\)
                        |
                        | \\[32mExpected boolean: true\\[39m
                        | \\[31mReceived boolean: false\\[39m
                        |
                        | \\s{4}at .*screenplay/assertion-error.spec.ts:10:24`));
                })
            ;
        });

        it('fails when discarding of an ability results in Error', async () => {
            const result = await playwrightTest(
                '--project=default',
                'screenplay/ability-close-error.spec.ts'
            ).then(ifExitCodeIsOtherThan(1, logOutput));

            expect(result.exitCode).to.equal(1);

            PickEvent.from(result.events)
                .next(SceneStarts,         event => expect(event.details.name).to.equal(new Name('A screenplay scenario fails when discarding an ability fails')))
                .next(TestRunnerDetected,  event => expect(event.name).to.equal(new Name('Playwright')))
                .next(SceneTagged,         event => expect(event.tag).to.equal(new CapabilityTag('Screenplay')))
                .next(SceneTagged,         event => expect(event.tag).to.equal(new FeatureTag('Playwright Test reporting')))
                .next(SceneFinished,       event => {
                    const outcome: ProblemIndication = event.outcome as ProblemIndication;

                    expect(outcome).to.be.instanceOf(ExecutionFailedWithError);
                    expect(outcome.error.name).to.equal('Error');

                    const message = outcome.error.message.split('\n');

                    expect(message[0]).to.equal('Error: 1 async operation has failed to complete:');
                    expect(message[1]).to.equal('[Stage] Actor Donald exits the stage - TypeError: Some internal error in ability');
                })
            ;
        });

        it(`fails when discarding of an ability doesn't complete within a timeout`, async () => {
            const result = await playwrightTest('--project=default', 'screenplay/ability-close-timeout.spec.ts')
                .then(ifExitCodeIsOtherThan(1, logOutput));

            expect(result.exitCode).to.equal(1);

            PickEvent.from(result.events)
                .next(SceneStarts,         event => expect(event.details.name).to.equal(new Name('A screenplay scenario fails when discarding an ability fails')))
                .next(TestRunnerDetected,  event => expect(event.name).to.equal(new Name('Playwright')))
                .next(SceneTagged,         event => expect(event.tag).to.equal(new CapabilityTag('Screenplay')))
                .next(SceneTagged,         event => expect(event.tag).to.equal(new FeatureTag('Playwright Test reporting')))
                .next(SceneFinished,       event => {
                    const outcome: ProblemIndication = event.outcome as ProblemIndication;

                    expect(outcome).to.be.instanceOf(ExecutionFailedWithError);
                    expect(outcome.error.name).to.equal('Error');

                    const message = outcome.error.message.split('\n');

                    expect(message[0]).to.equal('Error: 1 async operation has failed to complete within a 50ms cue timeout:');
                    expect(message[1]).to.match(/\d+ms - \[Stage] Actor Donald exits the stage/);
                })
            ;
        });

        it(`executes all the scenarios in the test suite even when some of them fail because of an error when discarding an ability`, async () => {
            const result = await playwrightTest(
                '--project=default',
                '--reporter=json:output/screenplay/ability_error.json',
                'screenplay/ability-close-error-should-not-affect-stage-cue.spec.ts'
            ).then(ifExitCodeIsOtherThan(1, logOutput));

            expect(result.exitCode).to.equal(1);

            PickEvent.from(result.events)
                .next(SceneStarts,         event => expect(event.details.name).to.equal(new Name('A screenplay scenario fails when discarding an ability fails')))
                .next(SceneFinished,       event => {
                    const outcome: ProblemIndication = event.outcome as ProblemIndication;

                    expect(outcome).to.be.instanceOf(ExecutionFailedWithError);
                    expect(outcome.error.name).to.equal('Error');

                    const message = outcome.error.message.split('\n');

                    expect(message[0]).to.equal('Error: 1 async operation has failed to complete:');
                    expect(message[1]).to.equal('[Stage] Actor Donald exits the stage - TypeError: Some internal error in ability');
                })
                .next(SceneStarts,         event => expect(event.details.name).to.equal(new Name('A screenplay scenario succeeds when ability is discarded successfully')))
                .next(SceneFinished,       event => {
                    expect(event.outcome).to.be.instanceOf(ExecutionSuccessful);
                })
                .next(SceneStarts,         event => expect(event.details.name).to.equal(new Name('A screenplay scenario fails if the ability fails to close again')))
                .next(SceneFinished,       event => {
                    const outcome: ProblemIndication = event.outcome as ProblemIndication;

                    expect(outcome).to.be.instanceOf(ExecutionFailedWithError);
                    expect(outcome.error.name).to.equal('Error');

                    const message = outcome.error.message.split('\n');

                    expect(message[0]).to.equal('Error: 1 async operation has failed to complete:');
                    expect(message[1]).to.equal('[Stage] Actor Donald exits the stage - TypeError: Some internal error in ability');
                })
            ;
        });
    });
});
