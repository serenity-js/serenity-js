import { Clock, Stage, StageManager } from '@serenity-js/core/lib/stage';

import { EventRecorder, expect, givenFollowingEvents, PickEvent } from '@integration/testing-tools';
import {
    Activity,
    Actor,
    AssertionError,
    Duration,
    ImplementationPendingError,
    Interaction,
    Task,
} from '@serenity-js/core';
import {
    ArtifactGenerated,
    SceneFinished,
    SceneStarts,
    TaskFinished,
    TaskStarts,
    TestRunFinished,
} from '@serenity-js/core/lib/events';
import { FileSystemLocation, Path } from '@serenity-js/core/lib/io';
import {
    ActivityDetails,
    Category,
    ExecutionCompromised,
    ExecutionFailedWithAssertionError,
    ExecutionFailedWithError,
    ExecutionIgnored,
    ExecutionSkipped,
    ExecutionSuccessful,
    ImplementationPending,
    Name,
    Outcome, Photo,
    ScenarioDetails,
} from '@serenity-js/core/lib/model';
import { given } from 'mocha-testdata';
import { protractor } from 'protractor';
import { BrowseTheWeb } from '../../src/screenplay';
import { Photographer } from '../../src/stage';

describe('Photographer', () => {

    const clock = new Clock();

    let stageManager: StageManager,
        stage: Stage,
        photographer: Photographer,
        recorder: EventRecorder;

    beforeEach(() => {
        stageManager = new StageManager(Duration.ofSeconds(1), clock);
        recorder = new EventRecorder();

        stage = new Stage({
            actor(name: string): Actor {
                return new Actor(name, stageManager as unknown as StageManager, clock)
                    .whoCan(BrowseTheWeb.using(protractor.browser));
            },
        }, stageManager);

        stage.assign(recorder);
    });

    describe(`when there's no actor in the spotlight`, () => {
        const
            defaultCardScenario = new ScenarioDetails(
                new Name('Paying with a default card'),
                new Category('Online Checkout'),
                new FileSystemLocation(
                    new Path(`payments/checkout.feature`),
                ),
            ),
            pickACard = new ActivityDetails(new Name('Pick the default credit card'));

        beforeEach(() => {
            photographer = new Photographer();
            stage.assign(photographer);
        });

        given(
            new ExecutionSkipped(),
            new ExecutionIgnored(),
            new ExecutionSuccessful(),
        ).
        it(`doesn't take a picture if everything goes well`, (outcome: Outcome) => {
            givenFollowingEvents(
                new SceneStarts(defaultCardScenario),
                new TaskStarts(pickACard),
                new TaskFinished(pickACard, outcome),
                new SceneFinished(defaultCardScenario, outcome),
                new TestRunFinished(),
            ).areSentTo(photographer);

            return stageManager.waitForNextCue().then(() => {
                expect(recorder.events).to.have.lengthOf(0);
            });
        });

        given(
            { description: 'compromised',               outcome: new ExecutionCompromised(new Error('Database is down'))                                                },
            { description: 'error',                     outcome: new ExecutionFailedWithError(new TypeError())                                                          },
            { description: 'assertion error',           outcome: new ExecutionFailedWithAssertionError(new AssertionError(`expected false to equal true`, false, true)) },
            { description: 'implementation pending',    outcome: new ImplementationPending(new ImplementationPendingError('method missing'))                            },
        ).
        it(`does nothing, even when a problem occurs`, ({ outcome }) => {
            givenFollowingEvents(
                new SceneStarts(defaultCardScenario),
                new SceneFinished(defaultCardScenario, outcome),
                new TestRunFinished(),
            ).areSentTo(photographer);

            return stageManager.waitForNextCue().then(() => {
                expect(recorder.events).to.have.lengthOf(0);
            });
        });
    });

    describe(`when there's an actor in the spotlight`, () => {

        class Perform {
            static interactionThatPasses = () =>
                Interaction.where(`#actor succeeds`, actor => void 0)

            static interactionThatFailsWith = (errorType: new (message: string) => Error) =>
                Interaction.where(`#actor fails due to ${ errorType.name }`, actor => { throw new errorType('failure'); })

            static taskWith = (...activities: Activity[]) => Task.where(`#actor performs activities`, ...activities);
        }

        describe(`and it's instructed to take a picture when a problem occurs,`, () => {

            beforeEach(() => {
                photographer = new Photographer();
                stage.assign(photographer);
            });

            it(`does nothing if everything goes well`, () =>
                expect(stage.theActorCalled('Betty').attemptsTo(
                    Perform.interactionThatPasses(),
                )).to.be.fulfilled.then(() => {
                    expect(recorder.events).to.have.lengthOf(2);    // Interaction starts and finishes
                }));

            it(`takes a picture of the website when a problem occurs`, () =>
                expect(stage.theActorCalled('Betty').attemptsTo(
                    Perform.interactionThatFailsWith(Error),
                )).to.be.rejected.then(() => stageManager.waitForNextCue().then(() => {
                    PickEvent.from(recorder.events)
                        .next(ArtifactGenerated, event => {
                            expect(event.name.value).to.equal(`Betty fails due to Error`);
                            expect(event.artifact).to.be.instanceof(Photo);
                        });
                })));

            it(`takes only one picture, even though nested tasks might all be marked as failing`, () =>
                expect(stage.theActorCalled('Betty').attemptsTo(
                    Perform.taskWith(
                        Perform.taskWith(
                            Perform.interactionThatFailsWith(TypeError),
                        ),
                    ),
                )).to.be.rejected.then(() => stageManager.waitForNextCue().then(() => {
                    PickEvent.from(recorder.events)
                        .next(ArtifactGenerated, event => {
                            expect(event.name.value).to.equal(`Betty fails due to TypeError`);
                            expect(event.artifact).to.be.instanceof(Photo);
                        });
                })));
        });
    });
});
