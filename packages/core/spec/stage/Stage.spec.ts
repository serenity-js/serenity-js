import 'mocha';

import * as sinon from 'sinon';

import { ConfigurationError, LogicError } from '../../src/errors';
import { Actor } from '../../src/screenplay';
import { Cast, Stage } from '../../src/stage';
import { expect } from '../expect';

describe('Stage', () => {

    // Sinon can't stub abstract classes, such as {@link Cast}, hence this dummy implementation
    class CustomActors implements Cast {
        actor(name: string): Actor {
            return null;
        }
    }

    /**
     * @test {Stage#actor}
     * @test {Stage#theActorCalled}
     */
    it('provides both the more verbose and more concise way of accessing the actors', () => {
        const
            name   = 'Alice',
            actors = sinon.createStubInstance(CustomActors),
            stage  = new Stage(actors);

        actors.actor.withArgs(name).returns(Actor.named(name));

        expect(stage.actor(name)).to.equal(stage.theActorCalled(name));
    });

    describe('when instantiating actors', () => {

        /** @test {Stage#actor} */
        it('instantiates a new actor when their name is called for the first time', () => {
            const
                name   = 'Alice',
                actors = sinon.createStubInstance(CustomActors),
                stage  = new Stage(actors);

            actors.actor.withArgs(name).returns(Actor.named(name));

            const actor = stage.actor(name);

            expect(actors.actor).to.have.been.calledWith(name);
            expect(actor.name).to.equal('Alice');
        });

        /** @test {Stage#actor} */
        it('returns an existing actor if it has already been instantiated before', () => {
            const
                name   = 'Alice',
                actors = sinon.createStubInstance(CustomActors),
                stage  = new Stage(actors);

            actors.actor.withArgs(name).returns(Actor.named(name));

            const a1 = stage.actor(name);
            const a2 = stage.actor(name);

            expect(actors.actor).to.have.been.calledWith(name);
            expect(actors.actor).to.have.been.calledOnce;                    // tslint:disable-line:no-unused-expression

            expect(a1).to.equal(a2);
        });
    });

    describe('when referencing a recently retrieved actor', () => {

        /** @test {Stage#actor} */
        it('retrieves the current actor, if there is any', () => {
            const
                name   = 'Alice',
                actors = sinon.createStubInstance(CustomActors),
                stage  = new Stage(actors);

            actors.actor.withArgs(name).returns(Actor.named(name));

            const a1 = stage.actor(name);
            const a2 = stage.theActorInTheSpotlight();

            expect(a2).to.equal(a1);
        });

        /**
         * @test {Stage#currentActor}
         * @test {Stage#theActorInTheSpotlight}
         */
        it('provides both the more verbose and more concise way of accessing the actors in the spotlight', () => {
            const
                name   = 'Alice',
                actors = sinon.createStubInstance(CustomActors),
                stage  = new Stage(actors);

            actors.actor.withArgs(name).returns(Actor.named(name));

            const a1 = stage.actor(name);
            const a2 = stage.theActorInTheSpotlight();
            const a3 = stage.currentActor();

            expect(a1).to.equal(a2);
            expect(a1).to.equal(a3);
        });

        /**
         * @test {Stage#currentActor}
         * @test {Stage#theActorInTheSpotlight}
         */
        it('complains if you try to access the actor in the spotlight, but there isn\'t any yet', () => {
            const
                actors = sinon.createStubInstance(CustomActors),
                stage  = new Stage(actors);

            expect(
                () => stage.theActorInTheSpotlight(),
            ).to.throw(LogicError, `There is no actor in the spotlight yet. Make sure you instantiate one with stage.actor(actorName) before calling this method.`);
        });
    });

    describe('when an error occurs', () => {

        it('complains when instantiated with no Cast', () => {
            expect(() => {
                const stage = new Stage(null);
            }).to.throw(Error, 'Cast should be defined');
        });

        /** @test {Stage#actor} */
        it('complains if the Cast does not provide a way to instantiate a given actor', () => {
            const
                name   = 'Alice',
                actors = sinon.createStubInstance(CustomActors),
                stage  = new Stage(actors);

            actors.actor.withArgs(name).returns(undefined);

            expect(() => {
                stage.actor(name);
            }).to.throw(ConfigurationError, `Instead of a new instance of actor "${ name }", CustomActors returned undefined`);
        });

        /** @test {Stage#actor} */
        it('complains if the Cast throws an error during actor instantiation', () => {
            const
                name   = 'Alice',
                actors = sinon.createStubInstance(CustomActors),
                stage  = new Stage(actors);

            actors.actor.withArgs(name).throws(new TypeError('Something is not quite right'));

            expect(() => {
                stage.actor(name);
            }).to.throw(ConfigurationError, `CustomActors encountered a problem when instantiating actor "${ name }"`);
        });
    });
});
