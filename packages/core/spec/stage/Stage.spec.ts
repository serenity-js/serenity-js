import 'mocha';

import * as sinon from 'sinon';

import { ConfigurationError, LogicError } from '../../src/errors';
import { Actor } from '../../src/screenplay';
import { DressingRoom, Stage, StageManager } from '../../src/stage';
import { expect } from '../expect';

describe('Stage', () => {

    class Extras implements DressingRoom {
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

    describe('when an error occurs', () => {

        it('complains when instantiated with no DressingRoom', () => {
            expect(() => {
                const stage = new Stage(null, stageManager as unknown as StageManager);
            }).to.throw(Error, 'DressingRoom should be defined');
        });

        it('complains when instantiated with no StageManager', () => {
            expect(() => {
                const stage = new Stage(new Extras(), null);
            }).to.throw(Error, 'StageManager should be defined');
        });

        /** @test {Stage#actor} */
        it('complains if the DressingRoom does not provide a way to instantiate a given actor', () => {
            const
                name   = 'Alice',
                actors: DressingRoom = {
                    prepare: (actor: Actor) => undefined,
                },
                stage  = new Stage(actors, stageManager as unknown as StageManager);

            expect(() => {
                stage.actor(name);
            }).to.throw(ConfigurationError, `Instead of a new instance of actor "${ name }", DressingRoom returned undefined`);
        });

        /** @test {Stage#actor} */
        it('complains if the DressingRoom does not provide a way to prepare a given actor and mentions the type of the DressingRoom, when available', () => {
            class AwesomeActors implements DressingRoom {
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
        it('complains if the DressingRoom throws an error during actor instantiation', () => {
            const
                name   = 'Alice',
                actors: DressingRoom = {
                    prepare: (actor: Actor) => { throw new Error(`I'm not working today`); },
                },
                stage  = new Stage(actors, stageManager as unknown as StageManager);

            expect(() => {
                stage.actor(name);
            }).to.throw(ConfigurationError, `DressingRoom encountered a problem when preparing actor "${ name }" for stage`);
        });

        /** @test {Stage#actor} */
        it('complains if the DressingRoom throws an error during actor instantiation and mentions the type of the DressingRoom, when available', () => {
            class MoodyActors implements DressingRoom {
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
