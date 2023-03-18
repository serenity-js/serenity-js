import 'mocha';

import { expect, givenFollowingEvents } from '@integration/testing-tools';
import { AssertionError, ImplementationPendingError, LogicError } from '@serenity-js/core';
import { SceneFinished, SceneFinishes, SceneStarts, TaskFinished, TaskStarts, TestRunFinished } from '@serenity-js/core/lib/events';
import {
    ExecutionCompromised,
    ExecutionFailedWithAssertionError,
    ExecutionFailedWithError,
    ExecutionIgnored,
    ExecutionSkipped,
    ExecutionSuccessful,
    ImplementationPending,
    Outcome,
} from '@serenity-js/core/lib/model';
import { Photographer, TakePhotosOfFailures } from '@serenity-js/web';
import { given } from 'mocha-testdata';

import { create } from './create';
import { activityId, defaultCardScenario, pickACard, sceneId } from './fixtures';

describe('Photographer', () => {

    it('complains when sent DomainEvents before getting assigned to a Stage', () => {
        const photographer = new Photographer(new TakePhotosOfFailures());
        expect(() => photographer.notifyOf(new SceneStarts(sceneId, defaultCardScenario)))
            .to.throw(LogicError, `Photographer needs to be assigned to the Stage before it can be notified of any DomainEvents`);
    });

    describe(`when there's no actor in the spotlight`, () => {

        given(
            new ExecutionSkipped(),
            new ExecutionSuccessful(),
        ).
        it(`doesn't take a picture if everything goes well`, (outcome: Outcome) => {
            const { stage, recorder } = create();

            const photographer = new Photographer(new TakePhotosOfFailures(), stage);
            stage.assign(photographer);

            givenFollowingEvents(
                new SceneStarts(sceneId, defaultCardScenario),
                new TaskStarts(sceneId, activityId, pickACard),
                new TaskFinished(sceneId, activityId, pickACard, outcome),
                new SceneFinishes(sceneId),
                new SceneFinished(sceneId, defaultCardScenario, outcome),
                new TestRunFinished(new ExecutionSuccessful()),
            ).areSentTo(photographer);

            return stage.waitForNextCue().then(() => {
                expect(recorder.events).to.have.lengthOf(0);
            });
        });

        given(
            { description: 'compromised',               outcome: new ExecutionCompromised(new Error('Database is down'))                                                },
            { description: 'error',                     outcome: new ExecutionFailedWithError(new TypeError('Wrong type'))                                                          },
            { description: 'assertion error',           outcome: new ExecutionFailedWithAssertionError(new AssertionError(`expected false to equal true`)) },
            { description: 'implementation pending',    outcome: new ImplementationPending(new ImplementationPendingError('method missing'))                            },
            { description: 'ignored',                   outcome: new ExecutionIgnored(new Error('Failed, retrying'))                                                    },
        ).
        it('does nothing, even when a problem occurs', ({ outcome }) => {
            const { stage, recorder } = create();

            const photographer = new Photographer(new TakePhotosOfFailures(), stage);
            stage.assign(photographer);

            givenFollowingEvents(
                new SceneStarts(sceneId, defaultCardScenario),
                new SceneFinishes(sceneId),
                new SceneFinished(sceneId, defaultCardScenario, outcome),
                new TestRunFinished(new ExecutionFailedWithError(outcome.error)),
            ).areSentTo(photographer);

            return stage.waitForNextCue().then(() => {
                expect(recorder.events).to.have.lengthOf(0);
            });
        });
    });
});
