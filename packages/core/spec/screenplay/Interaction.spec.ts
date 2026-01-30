
import { beforeEach, describe, it } from 'mocha';
import { given } from 'mocha-testdata';
import * as sinon from 'sinon';

import { ErrorFactory } from '../../src/errors';
import type { ArtifactGenerated } from '../../src/events';
import { JSONData, Name } from '../../src/model';
import type { Answerable} from '../../src/screenplay';
import { Actor, Clock, Duration, Interaction, Masked, Question, Task, the } from '../../src/screenplay';
import { Stage, StageManager } from '../../src/stage';
import { Extras } from '../../src/stage/Extras';
import { expect } from '../expect';

const p = <T>(value: T) =>
    Promise.resolve(value);

const q = <T>(description: string, value: T) =>
    Question.about(description, actor => value);

function doNothing(actor: Actor) {
    /* do nothing */
}

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
            Interaction.where(`#actor interacts with the system`, doNothing);

        const location = activity().instantiationLocation();

        expect(location.path.basename()).to.equal('Interaction.spec.ts');
        expect(location.line).to.equal(50);
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
                    Interaction.where(input, doNothing);

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
                    Interaction.where(input, doNothing);

                const description = await interaction().describedBy(Ivonne);

                expect(description).to.equal(expected);
            });

            it('replaces any placeholders with their descriptions', async () => {
                const systemUnderTest = (name: Answerable<string>) =>
                    Question.about('system under test', actor_ => name)
                        .describedAs(Question.formattedValue());

                const interactWith = (environmentName: Answerable<string>) =>
                    Interaction.where(the`#actor interacts with ${ systemUnderTest(environmentName) }`, doNothing);

                const interaction = interactWith('prod');

                const description = await interaction.describedBy(Ivonne);
                const toString    = interaction.toString();

                expect(description).to.equal('Ivonne interacts with "prod"');
                expect(toString).to.equal('#actor interacts with system under test');
            });

            describe('with masked values', () => {

                it('masks the value in the description', async () => {
                    const interaction = Task.where(the`#actor enters ${ Masked.valueOf(`password`) }`);

                    const description = await interaction.describedBy(Ivonne);
                    const toString    = interaction.toString();

                    expect(description).to.equal(`Ivonne enters [a masked value]`);
                    expect(toString).to.equal(`#actor enters [a masked value]`);
                });

                it(`masks the value in the description when it's nested in an object`, async () => {
                    const description = the`#actor enters ${ { password: Masked.valueOf(`password`) } }`;
                    const task = Interaction.where(description, doNothing);

                    expect(task.toString()).to.equal(`#actor enters { password: [a masked value] }`);
                });

                it(`masks the value in the description when it's nested in an array`, async () => {
                    const description = the`#actor enters ${ [ Masked.valueOf(`password`) ] }`;
                    const task = Interaction.where(description, doNothing);

                    expect(task.toString()).to.equal(`#actor enters [ [a masked value] ]`);
                });
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
