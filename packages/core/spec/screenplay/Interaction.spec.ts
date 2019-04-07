import 'mocha';
import * as sinon from 'sinon';

import { Actor, Interaction } from '../../src/screenplay';

import { JSONData, Name } from '../../src/model';
import { Stage } from '../../src/stage';
import { expect } from '../expect';

describe('Interaction', () => {

    const
        stage  = sinon.createStubInstance(Stage),
        Ivonne = new Actor('Ivonne', stage as unknown as Stage);

    describe('when defining an interaction', () => {

        /** @test {Interaction} */
        it(`provides a convenient factory method for synchronous interactions`, () => {
            const spy = sinon.spy();

            const InteractWithTheSystem = () => Interaction.where(`#actor interacts with the system`, (actor: Actor) => {
                spy(actor);
            });

            return expect(Ivonne.attemptsTo(
                InteractWithTheSystem(),
            ))
            .to.be.fulfilled
            .then(() => {
                expect(spy).to.have.been.calledWith(Ivonne);
            });
        });

        /** @test {Interaction} */
        it(`provides a convenient factory method for asynchronous interactions`, () => {
            const spy = sinon.spy();

            const InteractWithTheSystem = () => Interaction.where(`#actor interacts with the system`, (actor: Actor) => {
                spy(actor);

                return Promise.resolve();
            });

            return expect(Ivonne.attemptsTo(
                InteractWithTheSystem(),
            ))
            .to.be.fulfilled
            .then(() => {
                expect(spy).to.have.been.calledWith(Ivonne);
            });
        });
    });

    describe(`when handling errors`, () => {
        const error = new Error(`We're sorry, something happened`);

        it(`rejects the promise when the interaction function rejects a promise`, () => {
            const InteractWithTheSystem = () => Interaction.where(`#actor interacts with the system`, (actor: Actor) => Promise.reject(error));

            return expect(Ivonne.attemptsTo(
                InteractWithTheSystem(),
            )).to.be.rejectedWith(error);
        });

        it(`rejects the promise when the interaction function throws an error`, () => {

            const InteractWithTheSystem = () => Interaction.where(`#actor interacts with the system`, (actor: Actor) => { throw error; });

            return expect(Ivonne.attemptsTo(
                InteractWithTheSystem(),
            )).to.be.rejectedWith(error);
        });
    });

    /** @test {Interaction} */
    it('can optionally emit an artifact to be attached to the report or stored', () => {
        const spy = sinon.spy();

        const InteractWithTheSystem = () => Interaction.where(`#actor interacts with the system`, (actor: Actor) => {
            spy(actor);

            actor.collect(JSONData.fromJSON({ token: '123' }), new Name('Session Token'));
        });

        return expect(Ivonne.attemptsTo(
            InteractWithTheSystem(),
        ))
        .to.be.fulfilled
        .then(() => {
            expect(spy).to.have.been.calledWith(Ivonne);
        });
    });
});
