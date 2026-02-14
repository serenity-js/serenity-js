import { beforeEach, describe, it } from 'mocha';
import * as sinon from 'sinon';

import { ConfigurationError, ErrorFactory, LogicError } from '../../src/errors';
import { SceneFinished, SceneFinishes, SceneStarts, TestRunFinished, TestRunFinishes } from '../../src/events';
import { FileSystemLocation, Path, trimmed } from '../../src/io';
import { ActivityDetails, Category, CorrelationId, ExecutionSuccessful, Name, ScenarioDetails } from '../../src/model';
import type { Actor, Discardable} from '../../src/screenplay';
import { Ability, Clock, Duration } from '../../src/screenplay';
import type { Cast} from '../../src/stage';
import { Stage, StageManager } from '../../src/stage';
import { expect } from '../expect';

describe('Stage', () => {

    class Extras implements Cast {
        prepare(actor: Actor): Actor {
            return actor;
        }
    }

    const stageManager = sinon.createStubInstance(StageManager);
    const clock = new Clock();
    const interactionTimeout = Duration.ofSeconds(5);

    it('provides both the more verbose and more concise way of accessing the actors', () => {
        const
            name   = 'Alice',
            actors = new Extras(),
            stage  = new Stage(actors, stageManager as unknown as StageManager, new ErrorFactory(), clock, interactionTimeout);

        expect(stage.actor(name)).to.equal(stage.theActorCalled(name));
    });

    describe('when instantiating actors', () => {

        it('instantiates a new actor when their name is called for the first time', () => {
            const
                name   = 'Alice',
                actors = new Extras(),
                stage  = new Stage(actors, stageManager as unknown as StageManager, new ErrorFactory(), clock, interactionTimeout);

            sinon.spy(actors, 'prepare');

            const actor = stage.actor(name);

            expect((actors.prepare as any).getCall(0).args[0].name).to.equal(name);
            expect(actor.name).to.equal('Alice');
        });

        it('returns an existing actor if it has already been instantiated before', () => {
            const
                name   = 'Alice',
                actors = new Extras(),
                stage  = new Stage(actors, stageManager as unknown as StageManager, new ErrorFactory(), clock, interactionTimeout);

            sinon.spy(actors, 'prepare');

            const a1 = stage.actor(name);
            const a2 = stage.actor(name);

            expect((actors.prepare as any).getCall(0).args[0].name).to.equal(name);
            expect(actors.prepare).to.have.been.calledOnce;

            expect(a1).to.equal(a2);
        });
    });

    describe('when referencing a recently retrieved actor', () => {

        it('retrieves the current actor, if there is any', () => {
            const
                name   = 'Alice',
                stage  = new Stage(new Extras(), stageManager as unknown as StageManager, new ErrorFactory(), clock, interactionTimeout);

            const a1 = stage.actor(name);
            const a2 = stage.theActorInTheSpotlight();

            expect(a2).to.equal(a1);
        });

        it('provides both the more verbose and more concise way of accessing the actors in the spotlight', () => {
            const
                name   = 'Alice',
                stage  = new Stage(new Extras(), stageManager as unknown as StageManager, new ErrorFactory(), clock, interactionTimeout);

            const a1 = stage.actor(name);
            const a2 = stage.theActorCalled(name);
            const a3 = stage.theActorInTheSpotlight();

            expect(a1).to.equal(a2);
            expect(a1).to.equal(a3);
        });

        it(`complains if you try to access the actor in the spotlight, but there isn't any yet`, () => {
            const
                stage  = new Stage(new Extras(), stageManager as unknown as StageManager, new ErrorFactory(), clock, interactionTimeout);

            expect(
                () => stage.theActorInTheSpotlight(),
            ).to.throw(LogicError, `There is no actor in the spotlight yet. Make sure you instantiate one with stage.actor(actorName) before calling this method.`);
        });
    });

    describe('when instantiating and dismissing the actors', () => {

        class SomeAbilityThatNeedsDiscarding
            extends Ability
            implements Discardable
        {
            discard(): Promise<void> | void {
                return Promise.resolve();
            }
        }

        class Spies implements Cast {
            public readonly calls: Actor[] = [];

            prepare(actor: Actor): Actor {
                this.calls.push(actor);

                sinon.spy(actor, 'dismiss');

                return actor.whoCan(new SomeAbilityThatNeedsDiscarding());
            }
        }

        const
            sceneId = new CorrelationId('example-scene'),
            anotherSceneId = new CorrelationId('another-example-scene'),
            scenario = new ScenarioDetails(
                new Name('Paying with a default card'),
                new Category('Online Checkout'),
                new FileSystemLocation(
                    new Path('payments/checkout.feature'),
                ),
            );

        let manager: StageManager;

        beforeEach(() => {
            manager = new StageManager(Duration.ofMilliseconds(100), new Clock());
        });

        describe('performing a single scene', () => {
            it('dismisses actors instantiated after SceneStarts when SceneFinished, allowing for any async operations to finish first', async () => {
                const stage = new Stage(new Spies(), manager, new ErrorFactory(), clock, interactionTimeout);

                stage.announce(new SceneStarts(sceneId, scenario, stage.currentTime()));

                const actor = stage.actor('Bob');

                stage.announce(new SceneFinishes(sceneId, new ExecutionSuccessful(), stage.currentTime()));

                await stage.waitForNextCue();

                expect(actor.dismiss).to.have.been.calledOnce;

                stage.announce(new SceneFinished(sceneId, scenario, new ExecutionSuccessful(), stage.currentTime()));

                stage.announce(
                    new TestRunFinishes(stage.currentTime()),
                    new TestRunFinished(new ExecutionSuccessful(), stage.currentTime())
                );

                await stage.waitForNextCue()

                // make sure it's not called again
                expect(actor.dismiss).to.have.been.calledOnce;
            });

            it('re-instantiates actors dismissed when the SceneFinished', async () => {
                const actors = new Spies();

                const stage = new Stage(actors, manager, new ErrorFactory(), clock, interactionTimeout);

                stage.announce(new SceneStarts(sceneId, scenario, stage.currentTime()));
                stage.actor('Bob');
                stage.announce(
                    new SceneFinishes(sceneId, new ExecutionSuccessful(), stage.currentTime()),
                    new SceneFinished(sceneId, scenario, new ExecutionSuccessful(), stage.currentTime()),
                );

                await stage.waitForNextCue();

                stage.announce(new SceneStarts(anotherSceneId, scenario, stage.currentTime()));
                stage.actor('Bob');
                stage.announce(
                    new SceneFinishes(anotherSceneId, new ExecutionSuccessful(), stage.currentTime()),
                    new SceneFinished(anotherSceneId, scenario, new ExecutionSuccessful(), stage.currentTime()),
                );

                await stage.waitForNextCue();

                stage.announce(
                    new TestRunFinishes(stage.currentTime()),
                    new TestRunFinished(new ExecutionSuccessful(), stage.currentTime()),
                );

                await stage.waitForNextCue();

                expect(actors.calls).to.have.lengthOf(2);
            });
        });

        describe('performing across multiple scenes', () => {

            it('dismisses actors instantiated before SceneStarts when TestRunFinishes', async () => {
                const stage = new Stage(new Spies(), manager, new ErrorFactory(), clock, interactionTimeout);

                const actor = stage.actor('Bob');

                stage.announce(
                    new SceneStarts(sceneId, scenario, stage.currentTime()),
                    new SceneFinishes(sceneId, new ExecutionSuccessful(), stage.currentTime()),
                );

                expect(actor.dismiss).to.have.not.been.called;

                stage.announce(
                    new SceneFinished(sceneId, scenario, new ExecutionSuccessful(), stage.currentTime()),
                    new TestRunFinishes(stage.currentTime()),
                    new TestRunFinished(new ExecutionSuccessful(), stage.currentTime()),
                );

                await stage.waitForNextCue()

                // make sure it's called
                expect(actor.dismiss).to.have.been.calledOnce;
            });

            it('retains instances of actors instantiated before the SceneStarts', async () => {
                const actors = new Spies();

                const stage = new Stage(actors, manager, new ErrorFactory(), clock, interactionTimeout);

                stage.actor('Bob');

                stage.announce(new SceneStarts(sceneId, scenario, stage.currentTime()));
                stage.actor('Bob');
                stage.announce(new SceneFinished(sceneId, scenario, new ExecutionSuccessful(), stage.currentTime()));

                await stage.waitForNextCue();

                stage.announce(new SceneStarts(anotherSceneId, scenario, stage.currentTime()));
                stage.actor('Bob');
                stage.announce(new SceneFinished(anotherSceneId, scenario, new ExecutionSuccessful(), stage.currentTime()));

                await stage.waitForNextCue();

                stage.announce(
                    new TestRunFinishes(stage.currentTime()),
                    new TestRunFinished(new ExecutionSuccessful(), stage.currentTime()),
                );

                await stage.waitForNextCue();

                expect(actors.calls).to.have.lengthOf(1);
            });
        });
    });

    describe('when correlating activities', () => {

        it('assigns sceneIds', () => {
            const
                actors = new Extras(),
                stage  = new Stage(actors, stageManager as unknown as StageManager, new ErrorFactory(), clock, interactionTimeout);

            const assigned = stage.assignNewSceneId();
            const retrieved = stage.currentSceneId();

            expect(assigned).to.equal(retrieved);
        });

        it('returns a default sceneId when activities are performed outside of a test runner', () => {
            const
                actors = new Extras(),
                stage  = new Stage(actors, stageManager as unknown as StageManager, new ErrorFactory(), clock, interactionTimeout);

            const retrieved = stage.currentSceneId();

            expect(retrieved.value).to.equal('unknown');
        });

        it('assigns activityIds', () => {
            const
                actors = new Extras(),
                stage  = new Stage(actors, stageManager as unknown as StageManager, new ErrorFactory(), clock, interactionTimeout);

            const location = new FileSystemLocation(new Path('/home/alice/example.spec.ts'), 10, 4);
            const activityDetails = new ActivityDetails(new Name('example activity'), location);

            const assigned = stage.assignNewActivityId(activityDetails);
            const retrieved = stage.currentActivityId();

            expect(assigned).to.equal(retrieved);
        });

        it('complains if an activityId is attempted to be retrieved before is has been assigned', () => {
            const
                actors = new Extras(),
                stage  = new Stage(actors, stageManager as unknown as StageManager, new ErrorFactory(), clock, interactionTimeout);

            expect(() => stage.currentActivityId()).to.throw(LogicError, 'No activity is being performed. Did you call assignNewActivityId before invoking currentActivityId?');
        });
    });

    describe('when an error occurs', () => {

        it('complains when instantiated with no Cast', () => {
            expect(() => {
                const stage_ = new Stage(undefined, stageManager as unknown as StageManager, new ErrorFactory(), clock, interactionTimeout);
            }).to.throw(Error, 'Cast should be defined');
        });

        it('complains when instantiated with no StageManager', () => {
            expect(() => {
                const stage_ = new Stage(new Extras(), undefined, new ErrorFactory(), clock, interactionTimeout);
            }).to.throw(Error, 'StageManager should be defined');
        });

        it('complains if the Cast does not provide a way to instantiate a given actor', () => {
            const
                name   = 'Alice',
                actors: Cast = {
                    prepare: (actor: Actor) => undefined,
                },
                stage  = new Stage(actors, stageManager as unknown as StageManager, new ErrorFactory(), clock, interactionTimeout);

            expect(() => {
                stage.actor(name);
            }).to.throw(ConfigurationError, `Instead of a new instance of actor "${ name }", Cast returned undefined`);
        });

        it('complains if the Cast does not provide a way to prepare a given actor and mentions the type of the Cast, when available', () => {
            class AwesomeActors implements Cast {
                prepare(actor: Actor): Actor {
                    return undefined;
                }
            }

            const
                name   = 'Alice',
                actors = new AwesomeActors(),
                stage  = new Stage(actors, stageManager as unknown as StageManager, new ErrorFactory(), clock, interactionTimeout);

            expect(() => {
                stage.actor(name);
            }).to.throw(ConfigurationError, `Instead of a new instance of actor "${ name }", AwesomeActors returned undefined`);
        });

        it('complains if the Cast throws an error during actor instantiation', () => {
            const
                name   = 'Alice',
                actors: Cast = {
                    prepare: (actor: Actor) => { throw new Error(`I'm not working today`); },
                },
                stage  = new Stage(actors, stageManager as unknown as StageManager, new ErrorFactory(), clock, interactionTimeout);

            expect(() => {
                stage.actor(name);
            }).to.throw(ConfigurationError, `Cast encountered a problem when preparing actor "${ name }" for stage`);
        });

        it('complains if the Cast throws an error during actor instantiation and mentions the type of the Cast, when available', () => {
            class MoodyActors implements Cast {
                prepare(actor: Actor): Actor {
                    throw new Error(`I'm not working today`);
                }
            }

            const
                name   = 'Alice',
                actors = new MoodyActors(),
                stage  = new Stage(actors, stageManager as unknown as StageManager, new ErrorFactory(), clock, interactionTimeout);

            expect(() => {
                stage.actor(name);
            }).to.throw(ConfigurationError, `MoodyActors encountered a problem when preparing actor "${ name }" for stage`);
        });
    });

    describe('when generating errors', () => {

        const defaultLocation = new FileSystemLocation(new Path('/home/alice/example.spec.ts'), 10, 4);
        const activityDetails = new ActivityDetails(new Name('example activity'), defaultLocation);

        it('uses the current activity location by default', () => {
            const
                actors = new Extras(),
                stage  = new Stage(actors, stageManager as unknown as StageManager, new ErrorFactory(), clock, interactionTimeout);

            const assigned_ = stage.assignNewActivityId(activityDetails);

            const error = stage.createError(LogicError, { message: 'Example error generated within an activity' });

            expect(error.message).to.equal(trimmed`
                | Example error generated within an activity
                |     at /home/alice/example.spec.ts:10:4
            `);
        });

        it(`doesn't add information about location if no activity has started yet`, () => {
            const
                actors = new Extras(),
                stage  = new Stage(actors, stageManager as unknown as StageManager, new ErrorFactory(), clock, interactionTimeout);

            const error = stage.createError(LogicError, { message: 'Example error generated outside of an activity' });

            expect(error.message).to.equal(`Example error generated outside of an activity`);
        });

        it('allows for the location to be overridden', () => {
            const
                actors = new Extras(),
                stage  = new Stage(actors, stageManager as unknown as StageManager, new ErrorFactory(), clock, interactionTimeout);

            const assigned_ = stage.assignNewActivityId(activityDetails);

            const customLocation = new FileSystemLocation(new Path('/home/alice/another-example.spec.ts'), 16, 8);

            const error = stage.createError(LogicError, { message: 'Example error generated within an activity', location: customLocation });

            expect(error.message).to.equal(trimmed`
                | Example error generated within an activity
                |     at /home/alice/another-example.spec.ts:16:8
            `);
        });
    });

    describe('when emitting actor events', () => {

        let manager: StageManager;

        beforeEach(() => {
            manager = new StageManager(Duration.ofMilliseconds(100), new Clock());
        });

        class EventCapturingListener {
            public readonly events: any[] = [];

            notifyOf(event: any): void {
                this.events.push(event);
            }
        }

        it('emits ActorEntersStage on first actor instantiation', () => {
            const listener = new EventCapturingListener();
            const stage = new Stage(new Extras(), manager, new ErrorFactory(), clock, interactionTimeout);
            stage.assign(listener);

            stage.actor('Alice');

            const enterEvents = listener.events.filter(e => e.constructor.name === 'ActorEntersStage');
            expect(enterEvents).to.have.lengthOf(1);
            expect(enterEvents[0].actor.name).to.equal('Alice');
        });

        it('does NOT emit ActorEntersStage on subsequent retrieval of same actor', () => {
            const listener = new EventCapturingListener();
            const stage = new Stage(new Extras(), manager, new ErrorFactory(), clock, interactionTimeout);
            stage.assign(listener);

            stage.actor('Alice');
            stage.actor('Alice');
            stage.actor('Alice');

            const enterEvents = listener.events.filter(e => e.constructor.name === 'ActorEntersStage');
            expect(enterEvents).to.have.lengthOf(1);
        });

        it('does NOT emit ActorEntersStage when retrieving backstage actor within a scene', () => {
            const listener = new EventCapturingListener();
            const stage = new Stage(new Extras(), manager, new ErrorFactory(), clock, interactionTimeout);
            stage.assign(listener);

            // Create backstage actor (before scene starts)
            stage.actor('Alice');

            // Clear events to isolate scene behavior
            listener.events.length = 0;

            // Start a scene
            const sceneId = new CorrelationId('test-scene');
            const scenario = new ScenarioDetails(
                new Name('Test scenario'),
                new Category('Test'),
                new FileSystemLocation(new Path('test.feature')),
            );
            stage.announce(new SceneStarts(sceneId, scenario, stage.currentTime()));

            // Retrieve backstage actor within scene
            stage.actor('Alice');

            const enterEvents = listener.events.filter(e => e.constructor.name === 'ActorEntersStage');
            expect(enterEvents).to.have.lengthOf(0);
        });

        it('emits ActorSpotlighted when actor first becomes active', () => {
            const listener = new EventCapturingListener();
            const stage = new Stage(new Extras(), manager, new ErrorFactory(), clock, interactionTimeout);
            stage.assign(listener);

            stage.actor('Alice');

            const spotlightEvents = listener.events.filter(e => e.constructor.name === 'ActorSpotlighted');
            expect(spotlightEvents).to.have.lengthOf(1);
            expect(spotlightEvents[0].actor.name).to.equal('Alice');
        });

        it('does NOT emit ActorSpotlighted on consecutive retrieval of same actor', () => {
            const listener = new EventCapturingListener();
            const stage = new Stage(new Extras(), manager, new ErrorFactory(), clock, interactionTimeout);
            stage.assign(listener);

            stage.actor('Alice');
            stage.actor('Alice');
            stage.actor('Alice');

            const spotlightEvents = listener.events.filter(e => e.constructor.name === 'ActorSpotlighted');
            expect(spotlightEvents).to.have.lengthOf(1);
        });

        it('emits ActorSpotlighted when switching between actors', () => {
            const listener = new EventCapturingListener();
            const stage = new Stage(new Extras(), manager, new ErrorFactory(), clock, interactionTimeout);
            stage.assign(listener);

            stage.actor('Alice');
            stage.actor('Bob');
            stage.actor('Alice');

            const spotlightEvents = listener.events.filter(e => e.constructor.name === 'ActorSpotlighted');
            expect(spotlightEvents).to.have.lengthOf(3);
            expect(spotlightEvents[0].actor.name).to.equal('Alice');
            expect(spotlightEvents[1].actor.name).to.equal('Bob');
            expect(spotlightEvents[2].actor.name).to.equal('Alice');
        });

        it('emits ActorEntersStage before ActorSpotlighted for new actor', () => {
            const listener = new EventCapturingListener();
            const stage = new Stage(new Extras(), manager, new ErrorFactory(), clock, interactionTimeout);
            stage.assign(listener);

            stage.actor('Alice');

            const relevantEvents = listener.events.filter(
                e => e.constructor.name === 'ActorEntersStage' || e.constructor.name === 'ActorSpotlighted'
            );

            expect(relevantEvents).to.have.lengthOf(2);
            expect(relevantEvents[0].constructor.name).to.equal('ActorEntersStage');
            expect(relevantEvents[1].constructor.name).to.equal('ActorSpotlighted');
        });

        it('emits ActorEntersStage whenever a new actor is instantiated', () => {
            const listener = new EventCapturingListener();
            const stage = new Stage(new Extras(), manager, new ErrorFactory(), clock, interactionTimeout);
            stage.assign(listener);

            stage.actor('Alice');
            stage.actor('Bob');
            stage.actor('Alice');
            stage.actor('Bob');

            const relevantEvents = listener.events.filter(
                e => e.constructor.name === 'ActorEntersStage' || e.constructor.name === 'ActorSpotlighted'
            );

            expect(relevantEvents).to.have.lengthOf(6);
            // Alice
            expect(relevantEvents[0].constructor.name).to.equal('ActorEntersStage');
            expect(relevantEvents[1].constructor.name).to.equal('ActorSpotlighted');

            // Bob
            expect(relevantEvents[2].constructor.name).to.equal('ActorEntersStage');
            expect(relevantEvents[3].constructor.name).to.equal('ActorSpotlighted');

            // Back to Alice (no new ActorEntersStage, since Alice is already instantiated)
            expect(relevantEvents[4].constructor.name).to.equal('ActorSpotlighted');

            // Back to Bob (no new ActorEntersStage, since Bob is already instantiated)
            expect(relevantEvents[5].constructor.name).to.equal('ActorSpotlighted');
        });
    });
});
