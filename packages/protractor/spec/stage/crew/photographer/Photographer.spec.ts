import 'mocha';

import { expect, givenFollowingEvents } from '@integration/testing-tools';
import { AssertionError, ImplementationPendingError, LogicError } from '@serenity-js/core';
import { SceneFinished, SceneStarts, TaskFinished, TaskStarts, TestRunFinished } from '@serenity-js/core/lib/events';
import { FileSystemLocation, Path } from '@serenity-js/core/lib/io';
import {
    ActivityDetails,
    Category,
    CorrelationId,
    ExecutionCompromised,
    ExecutionFailedWithAssertionError,
    ExecutionFailedWithError,
    ExecutionIgnored,
    ExecutionSkipped,
    ExecutionSuccessful,
    ImplementationPending,
    Name,
    Outcome,
    ScenarioDetails,
} from '@serenity-js/core/lib/model';
import { given } from 'mocha-testdata';

import { Photographer, TakePhotosOfFailures } from '../../../../src/stage';
import { create } from './create';

describe('Photographer', () => {

    const
        defaultCardScenario = new ScenarioDetails(
            new Name('Paying with a default card'),
            new Category('Online Checkout'),
            new FileSystemLocation(
                new Path(`payments/checkout.feature`),
            ),
        ),
        pickACard = new ActivityDetails(new Name('Pick the default credit card')),
        sceneId = new CorrelationId('a-scene-id'),
        activityId = new CorrelationId('activity-id');

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
        it('doesn\'t take a picture if everything goes well', (outcome: Outcome) => {
            const { stage, recorder } = create();

            const photographer = new Photographer(new TakePhotosOfFailures(), stage);
            stage.assign(photographer);

            givenFollowingEvents(
                new SceneStarts(sceneId, defaultCardScenario),
                new TaskStarts(sceneId, activityId, pickACard),
                new TaskFinished(sceneId, activityId, pickACard, outcome),
                new SceneFinished(sceneId, defaultCardScenario, outcome),
                new TestRunFinished(),
            ).areSentTo(photographer);

            return stage.waitForNextCue().then(() => {
                expect(recorder.events).to.have.lengthOf(0);
            });
        });

        given(
            { description: 'compromised',               outcome: new ExecutionCompromised(new Error('Database is down'))                                                },
            { description: 'error',                     outcome: new ExecutionFailedWithError(new TypeError('Wrong type'))                                                          },
            { description: 'assertion error',           outcome: new ExecutionFailedWithAssertionError(new AssertionError(`expected false to equal true`, false, true)) },
            { description: 'implementation pending',    outcome: new ImplementationPending(new ImplementationPendingError('method missing'))                            },
            { description: 'ignored',                   outcome: new ExecutionIgnored(new Error('Failed, retrying'))                                                    },
        ).
        it('does nothing, even when a problem occurs', ({ outcome }) => {
            const { stage, recorder } = create();

            const photographer = new Photographer(new TakePhotosOfFailures(), stage);
            stage.assign(photographer);

            givenFollowingEvents(
                new SceneStarts(sceneId, defaultCardScenario),
                new SceneFinished(sceneId, defaultCardScenario, outcome),
                new TestRunFinished(),
            ).areSentTo(photographer);

            return stage.waitForNextCue().then(() => {
                expect(recorder.events).to.have.lengthOf(0);
            });
        });
    });
});
