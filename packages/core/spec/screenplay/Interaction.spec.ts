/* eslint-disable unicorn/consistent-function-scoping */
import { beforeEach, describe, it } from 'mocha';
import { given } from 'mocha-testdata';
import * as sinon from 'sinon';

import { ErrorFactory } from '../../src/errors';
import type { ArtifactGenerated } from '../../src/events';
import { JSONData, Name } from '../../src/model';
import { Actor, Clock, Duration, Interaction, Question } from '../../src/screenplay';
import { Stage, StageManager } from '../../src/stage';
import { Extras } from '../../src/stage/Extras';
import { expect } from '../expect';

const p = <T>(value: T) =>
    Promise.resolve(value);

const q = <T>(description: string, value: T) =>
    Question.about(description, actor => value);

describe('Interaction', () => {

    const interactionTimeout = Duration.ofSeconds(5);

    let stage: Stage,
        Ivonne: Actor,
        stageManager: sinon.SinonStubbedInstance<StageManager>;

    beforeEach(() => {
        stageManager = sinon.createStubInstance(StageManager);

        stage = new Stage(
            new Extras(),
            stageManager as unknown as StageManager,
            new ErrorFactory(),
            new Clock(),
            interactionTimeout,
        );
        Ivonne = new Actor('Ivonne', stage);
    });

    it('correctly detects its invocation location', () => {
        const activity = () =>
            Interaction.where(`#actor interacts with the system`, (actor_: Actor) => { /* do nothing */ });

        const location = activity().instantiationLocation();

        expect(location.path.basename()).to.equal('Interaction.spec.ts');
        expect(location.line).to.equal(45);
        expect(location.column).to.equal(26);
    });

    describe('when defining an interaction', () => {

        it('provides a convenient factory method for synchronous interactions', async () => {
            const spy = sinon.spy();

            const InteractWithTheSystem = () => Interaction.where(`#actor interacts with the system`, (actor: Actor) => {
                spy(actor);
            });

            await expect(Ivonne.attemptsTo(
                InteractWithTheSystem(),
            )).to.be.fulfilled

            expect(spy).to.have.been.calledWith(Ivonne);
        });

        it('provides a convenient factory method for asynchronous interactions', async () => {
            const spy = sinon.spy();

            const InteractWithTheSystem = () => Interaction.where(`#actor interacts with the system`, (actor: Actor) => {
                spy(actor);

                return Promise.resolve();
            });

            await expect(Ivonne.attemptsTo(
                InteractWithTheSystem(),
            )).to.be.fulfilled;

            expect(spy).to.have.been.calledWith(Ivonne);
        });
    });

    describe('when describing an interaction', () => {

        const description = '#actor interacts with the system';

        describe('toString()', () => {

            given([
                { description: 'string',                    input: description,                         expected: description      },
                { description: 'Promise<string>',           input: p(description),                      expected: 'Promise'        },
                { description: 'Question<string>',          input: q('some question', description),     expected: 'some question'  },
                { description: 'Question<Promise<string>>', input: q('some question', p(description)),  expected: 'some question'  },
            ]).
            it('produces a human-readable static description', ({ input, expected }) => {
                const interaction = () =>
                    Interaction.where(input, (actor: Actor) => { /* do nothing */ });

                expect(interaction().toString()).to.equal(expected);
            });
        });

        describe('describedBy(actor)', () => {

            const expected = 'Ivonne interacts with the system';

            given([
                { description: 'string',                    input: description                         },
                { description: 'Promise<string>',           input: p(description)                      },
                { description: 'Question<string>',          input: q('some question', description)     },
                { description: 'Question<Promise<string>>', input: q('some question', p(description))  },
            ]).
            it('produces a description resolved in the context of the given actor', async ({ input }) => {
                const interaction = () =>
                    Interaction.where(input, (actor: Actor) => { /* do nothing */ });

                const description = await interaction().describedBy(Ivonne);

                expect(description).to.equal(expected);
            });
        });
    });

    describe('when handling errors', () => {
        const error = new Error(`We're sorry, something happened`);

        it('rejects the promise when the interaction function rejects a promise', async () => {
            const InteractWithTheSystem = () => Interaction.where(`#actor interacts with the system`, (actor: Actor) => Promise.reject(error));

            await expect(Ivonne.attemptsTo(
                InteractWithTheSystem(),
            )).to.be.rejectedWith(error);
        });

        it('rejects the promise when the interaction function throws an error', async () => {

            const InteractWithTheSystem = () => Interaction.where(`#actor interacts with the system`, (actor: Actor) => { throw error; });

            await expect(Ivonne.attemptsTo(
                InteractWithTheSystem(),
            )).to.be.rejectedWith(error);
        });
    });

    it('can optionally emit an artifact to be attached to the report or stored', async () => {
        const
            expectedArtifact = JSONData.fromJSON({ token: '123' }),
            expectedArtifactName = new Name('Session Token');

        const InteractWithTheSystem = () => Interaction.where(`#actor interacts with the system`, (actor: Actor) => {
            actor.collect(expectedArtifact, expectedArtifactName);
        });

        await expect(Ivonne.attemptsTo(
            InteractWithTheSystem(),
        ))
        .to.be.fulfilled;

        const event = stageManager.notifyOf.args[1][0] as ArtifactGenerated;

        expect(event.name).to.equal(expectedArtifactName);
        expect(event.artifact).to.equal(expectedArtifact);
    });
});
