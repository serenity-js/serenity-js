import 'mocha';

import * as sinon from 'sinon';

import { ConfigurationError, LogicError } from '../../src/errors';
import { Actor, Interaction } from '../../src/screenplay';
import { Cast, Stage, StageManager } from '../../src/stage';
import { expect } from '../expect';

describe('Stage', () => {

    class Extras implements Cast {
        prepare(actor: Actor): Actor {
            return actor;
        }
    }

    const stageManager = sinon.createStubInstance(StageManager);

    /**
     * @test {Stage#actor}
     * @test {Stage#theActorCalled}
     */
    it('provides both the more verbose and more concise way of accessing the actors', () => {
        const
            name   = 'Alice',
            actors = new Extras(),
            stage  = new Stage(actors, stageManager as unknown as StageManager);

        expect(stage.actor(name)).to.equal(stage.theActorCalled(name));
    });

    describe('when instantiating actors', () => {

        /** @test {Stage#actor} */
        it('instantiates a new actor when their name is called for the first time', () => {
            const
                name   = 'Alice',
                actors = new Extras(),
                stage  = new Stage(actors, stageManager as unknown as StageManager);

            sinon.spy(actors, 'prepare');

            const actor = stage.actor(name);

            expect((actors.prepare as any).getCall(0).args[0].name).to.equal(name);
            expect(actor.name).to.equal('Alice');
        });

        /** @test {Stage#actor} */
        it('returns an existing actor if it has already been instantiated before', () => {
            const
                name   = 'Alice',
                actors = new Extras(),
                stage  = new Stage(actors, stageManager as unknown as StageManager);

            sinon.spy(actors, 'prepare');

            const a1 = stage.actor(name);
            const a2 = stage.actor(name);

            expect((actors.prepare as any).getCall(0).args[0].name).to.equal(name);
            expect(actors.prepare).to.have.been.calledOnce;                    // tslint:disable-line:no-unused-expression

            expect(a1).to.equal(a2);
        });
    });

    describe('when referencing a recently retrieved actor', () => {

        /** @test {Stage#actor} */
        it('retrieves the current actor, if there is any', () => {
            const
                name   = 'Alice',
                stage  = new Stage(new Extras(), stageManager as unknown as StageManager);

            const a1 = stage.actor(name);
            const a2 = stage.theActorInTheSpotlight();

            expect(a2).to.equal(a1);
        });

        /**
         * @test {Stage#theActorInTheSpotlight}
         * @test {Stage#theActorInTheSpotlight}
         */
        it('provides both the more verbose and more concise way of accessing the actors in the spotlight', () => {
            const
                name   = 'Alice',
                stage  = new Stage(new Extras(), stageManager as unknown as StageManager);

            const a1 = stage.actor(name);
            const a2 = stage.theActorCalled(name);
            const a3 = stage.theActorInTheSpotlight();

            expect(a1).to.equal(a2);
            expect(a1).to.equal(a3);
        });

        /**
         * @test {Stage#theActorInTheSpotlight}
         * @test {Stage#theActorInTheSpotlight}
         */
        it('complains if you try to access the actor in the spotlight, but there isn\'t any yet', () => {
            const
                stage  = new Stage(new Extras(), stageManager as unknown as StageManager);

            expect(
                () => stage.theActorInTheSpotlight(),
            ).to.throw(LogicError, `There is no actor in the spotlight yet. Make sure you instantiate one with stage.actor(actorName) before calling this method.`);
        });
    });

    describe('when correlating activities', () => {

        const SomeActivity = () => Interaction.where(`#actor doesn't do much`, actor => void 0);

        it('provides ActivityDetails for a given Activity', () => {
            const
                actors = new Extras(),
                stage  = new Stage(actors, stageManager as unknown as StageManager);

            const details = stage.activityDetailsFor(SomeActivity(), stage.actor('Alice'));

            expect(details.name.value).to.equal(`Alice doesn't do much`);
            expect(details.activityId.value).to.be.a('string');    // tslint:disable-line:no-unused-expression
        });

        it('allows for the recently ActivityDetails to be retrieved', () => {
            const
                actors = new Extras(),
                stage  = new Stage(actors, stageManager as unknown as StageManager);

            const details = stage.activityDetailsFor(SomeActivity(), stage.actor('Alice'));

            expect(stage.currentActivityDetails()).to.equal(details);
        });

        it('complains if ActivityDetails attempted to be retrieved before they have been generated', () => {
            const
                actors = new Extras(),
                stage  = new Stage(actors, stageManager as unknown as StageManager);

            expect(() => stage.currentActivityDetails()).to.throw(LogicError, 'No activity is being performed. Did you call activityDetailsFor before invoking currentActivityDetails?');
        });
    });

    describe('when an error occurs', () => {

        it('complains when instantiated with no Cast', () => {
            expect(() => {
                const stage = new Stage(null, stageManager as unknown as StageManager);
            }).to.throw(Error, 'Cast should be defined');
        });

        it('complains when instantiated with no StageManager', () => {
            expect(() => {
                const stage = new Stage(new Extras(), null);
            }).to.throw(Error, 'StageManager should be defined');
        });

        /** @test {Stage#actor} */
        it('complains if the Cast does not provide a way to instantiate a given actor', () => {
            const
                name   = 'Alice',
                actors: Cast = {
                    prepare: (actor: Actor) => undefined,
                },
                stage  = new Stage(actors, stageManager as unknown as StageManager);

            expect(() => {
                stage.actor(name);
            }).to.throw(ConfigurationError, `Instead of a new instance of actor "${ name }", Cast returned undefined`);
        });

        /** @test {Stage#actor} */
        it('complains if the Cast does not provide a way to prepare a given actor and mentions the type of the Cast, when available', () => {
            class AwesomeActors implements Cast {
                prepare(actor: Actor): Actor {
                    return undefined;
                }
            }

            const
                name   = 'Alice',
                actors = new AwesomeActors(),
                stage  = new Stage(actors, stageManager as unknown as StageManager);

            expect(() => {
                stage.actor(name);
            }).to.throw(ConfigurationError, `Instead of a new instance of actor "${ name }", AwesomeActors returned undefined`);
        });

        /** @test {Stage#actor} */
        it('complains if the Cast throws an error during actor instantiation', () => {
            const
                name   = 'Alice',
                actors: Cast = {
                    prepare: (actor: Actor) => { throw new Error(`I'm not working today`); },
                },
                stage  = new Stage(actors, stageManager as unknown as StageManager);

            expect(() => {
                stage.actor(name);
            }).to.throw(ConfigurationError, `Cast encountered a problem when preparing actor "${ name }" for stage`);
        });

        /** @test {Stage#actor} */
        it('complains if the Cast throws an error during actor instantiation and mentions the type of the Cast, when available', () => {
            class MoodyActors implements Cast {
                prepare(actor: Actor): Actor {
                    throw new Error(`I'm not working today`);
                }
            }

            const
                name   = 'Alice',
                actors = new MoodyActors(),
                stage  = new Stage(actors, stageManager as unknown as StageManager);

            expect(() => {
                stage.actor(name);
            }).to.throw(ConfigurationError, `MoodyActors encountered a problem when preparing actor "${ name }" for stage`);
        });
    });
});
