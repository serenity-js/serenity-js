import 'mocha';
import * as sinon from 'sinon';

import { Actor, EmitArtifact, Interaction } from '../../src/screenplay';

import { JSONData } from '../../src/model/artifacts';
import { expect } from '../expect';

describe('Interaction', () => {

    const Ivonne = Actor.named('Ivonne');

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

    /** @test {Interaction} */
    it('can optionally emit an artifact to be attached to the report or stored', () => {
        const spy = sinon.spy();

        const InteractWithTheSystem = () => Interaction.where(`#actor interacts with the system`, (actor: Actor, emitArtifact: EmitArtifact) => {
            spy(actor);

            emitArtifact(JSONData.fromJSON({ token: '123' }), 'Session Token');
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
