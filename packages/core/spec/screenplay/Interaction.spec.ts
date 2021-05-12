import 'mocha';

import * as sinon from 'sinon';

import { ArtifactGenerated } from '../../src/events';
import { JSONData, Name } from '../../src/model';
import { Actor, Interaction } from '../../src/screenplay';
import { Stage, StageManager } from '../../src/stage';
import { Extras } from '../../src/stage/Extras';
import { expect } from '../expect';

describe('Interaction', () => {

    let stage: Stage,
        Ivonne: Actor,
        stageManager: sinon.SinonStubbedInstance<StageManager>;

    beforeEach(() => {
        stageManager = sinon.createStubInstance(StageManager);

        stage = new Stage(
            new Extras(),
            stageManager as unknown as StageManager,
        );
        Ivonne = new Actor('Ivonne', stage);
    });

    describe('when defining an interaction', () => {

        /** @test {Interaction} */
        it('provides a convenient factory method for synchronous interactions', () => {
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
        it('provides a convenient factory method for asynchronous interactions', () => {
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

    describe('when handling errors', () => {
        const error = new Error(`We're sorry, something happened`);

        it('rejects the promise when the interaction function rejects a promise', () => {
            const InteractWithTheSystem = () => Interaction.where(`#actor interacts with the system`, (actor: Actor) => Promise.reject(error));

            return expect(Ivonne.attemptsTo(
                InteractWithTheSystem(),
            )).to.be.rejectedWith(error);
        });

        it('rejects the promise when the interaction function throws an error', () => {

            const InteractWithTheSystem = () => Interaction.where(`#actor interacts with the system`, (actor: Actor) => { throw error; });

            return expect(Ivonne.attemptsTo(
                InteractWithTheSystem(),
            )).to.be.rejectedWith(error);
        });
    });

    /** @test {Interaction} */
    it('can optionally emit an artifact to be attached to the report or stored', () => {
        const
            expectedArtifact = JSONData.fromJSON({ token: '123' }),
            expectedArtifactName = new Name('Session Token');

        const InteractWithTheSystem = () => Interaction.where(`#actor interacts with the system`, (actor: Actor) => {
            actor.collect(expectedArtifact, expectedArtifactName);
        });

        return expect(Ivonne.attemptsTo(
            InteractWithTheSystem(),
        ))
        .to.be.fulfilled
        .then(() => {
            const event = stageManager.notifyOf.args[1][0] as ArtifactGenerated;

            expect(event.name).to.equal(expectedArtifactName);
            expect(event.artifact).to.equal(expectedArtifact);
        });
    });
});
